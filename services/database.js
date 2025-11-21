import * as SQLite from 'expo-sqlite';

class DatabaseService {
    constructor() {
        this.db = null;
        this.MAX_SIZE_BYTES = 1 * 1024 * 1024; // 1 MB
        this.BATCH_SEND_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
        this.lastSendTime = Date.now();
    }

    /**
     * Initialize database and create tables
     */
    async init() {
        try {
            this.db = await SQLite.openDatabaseAsync('carelink_vitals.db');

            // Create vitals table
            await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS vitals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          temperature REAL,
          spo2 REAL,
          heart_rate REAL,
          systolic REAL,
          oxygen_saturation REAL,
          value REAL,
          timestamp INTEGER,
          synced INTEGER DEFAULT 0
        );
      `);

            // Create index for faster queries
            await this.db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_timestamp ON vitals(timestamp);
        CREATE INDEX IF NOT EXISTS idx_synced ON vitals(synced);
      `);

            console.log('Database initialized successfully');

            // Load last send time from storage
            await this.loadLastSendTime();

            return true;
        } catch (error) {
            console.error('Database initialization failed:', error);
            throw error;
        }
    }

    /**
     * Insert vital signs into database
     */
    async insertVital(vitalData) {
        try {
            const { Temperature, SpO2, HeartRate, systolic, OxygenSaturation, Value } = vitalData;

            const result = await this.db.runAsync(
                `INSERT INTO vitals (temperature, spo2, heart_rate, systolic, oxygen_saturation, value, timestamp, synced)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
                [
                    Temperature,
                    SpO2,
                    HeartRate,
                    systolic,
                    OxygenSaturation,
                    Value,
                    Date.now()
                ]
            );

            console.log('Vital inserted with ID:', result.lastInsertRowId);
            return result.lastInsertRowId;
        } catch (error) {
            console.error('Failed to insert vital:', error);
            throw error;
        }
    }

    /**
     * Get database size in bytes
     */
    async getDatabaseSize() {
        try {
            const result = await this.db.getFirstAsync(
                `SELECT COUNT(*) as count FROM vitals WHERE synced = 0`
            );
            // Rough estimate: each record is about 100 bytes
            const estimatedSize = (result?.count || 0) * 100;

            console.log('Database size:', estimatedSize, 'bytes');
            return estimatedSize;
        } catch (error) {
            console.error('Failed to get database size:', error);
            return 0;
        }
    }

    /**
     * Check if size trigger is met (> 1 MB)
     */
    async isSizeTriggerMet() {
        const size = await this.getDatabaseSize();
        return size >= this.MAX_SIZE_BYTES;
    }

    /**
     * Check if time trigger is met (6 hours)
     */
    isTimeTriggerMet() {
        const currentTime = Date.now();
        const timeDiff = currentTime - this.lastSendTime;
        return timeDiff >= this.BATCH_SEND_INTERVAL;
    }

    /**
     * Check if any trigger is met
     */
    async shouldSendData(criticality) {
        let vals = 0
        const sizeTrigger = await this.isSizeTriggerMet();
        const timeTrigger = this.isTimeTriggerMet();

        if (criticality > 0.7) {
            vals = 2
        }
        else if (sizeTrigger || timeTrigger) {
            vals = 1
        }
        console.log('Trigger check - Size:', sizeTrigger, 'Time:', timeTrigger, 'Vals:', vals);

        return vals;
    }

    /**
     * Get all unsynced vitals from database and format as JSON
     * After retrieval, mark them as synced and delete
     */
    async dataFromSQL(flag_to_send = 1) {
        try {
            // Get all unsynced vitals
            const vitals = await this.db.getAllAsync(
                `SELECT * FROM vitals WHERE synced = 0 ORDER BY timestamp ASC`
            );

            if (!vitals || vitals.length === 0) {
                console.log('No vitals to sync');
                return null;
            }

            // Format data according to required JSON structure
            const formattedVitals = vitals.map(vital => ({
                temperature: vital.temperature,
                heartrate: vital.heart_rate,
                spo2: vital.spo2,
                oxy_sat: vital.oxygen_saturation,
                systolic: vital.systolic,
                value: vital.value
            }));

            let flag = false
            if (flag_to_send == 2) {
                flag = true
            }
            const payload = {
                priority: flag,
                vitals: formattedVitals
            };

            console.log(`Prepared ${vitals.length} vitals for sending`);

            // Get IDs for deletion after successful send
            const ids = vitals.map(v => v.id);

            return {
                payload,
                ids
            };
        } catch (error) {
            console.error('Failed to get data from SQL:', error);
            throw error;
        }
    }

    /**
     * Mark vitals as synced after successful transmission
     */
    async markAsSynced(ids) {
        try {
            if (!ids || ids.length === 0) return;

            const placeholders = ids.map(() => '?').join(',');

            await this.db.runAsync(
                `UPDATE vitals SET synced = 1 WHERE id IN (${placeholders})`,
                ids
            );

            console.log(`Marked ${ids.length} vitals as synced`);
        } catch (error) {
            console.error('Failed to mark as synced:', error);
            throw error;
        }
    }

    /**
     * Delete synced vitals to prevent duplication
     */
    async deleteSyncedVitals(ids) {
        try {
            if (!ids || ids.length === 0) return;

            const placeholders = ids.map(() => '?').join(',');

            const result = await this.db.runAsync(
                `DELETE FROM vitals WHERE id IN (${placeholders})`,
                ids
            );

            console.log(`Deleted ${result.changes} synced vitals`);
            return result.changes;
        } catch (error) {
            console.error('Failed to delete synced vitals:', error);
            throw error;
        }
    }

    /**
     * Update last send time
     */
    async updateLastSendTime() {
        this.lastSendTime = Date.now();
        // You can also store this in AsyncStorage if needed for persistence
        try {
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            await AsyncStorage.setItem('lastVitalSendTime', this.lastSendTime.toString());
        } catch (error) {
            console.error('Failed to save last send time:', error);
        }
    }

    /**
     * Load last send time from storage
     */
    async loadLastSendTime() {
        try {
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            const stored = await AsyncStorage.getItem('lastVitalSendTime');
            if (stored) {
                this.lastSendTime = parseInt(stored);
                console.log('Loaded last send time:', new Date(this.lastSendTime));
            }
        } catch (error) {
            console.error('Failed to load last send time:', error);
        }
    }

    /**
     * Get count of unsynced vitals
     */
    async getUnsyncedCount() {
        try {
            const result = await this.db.getFirstAsync(
                `SELECT COUNT(*) as count FROM vitals WHERE synced = 0`
            );
            return result?.count || 0;
        } catch (error) {
            console.error('Failed to get unsynced count:', error);
            return 0;
        }
    }

    /**
     * Get statistics
     */
    async getStats() {
        try {
            const unsynced = await this.getUnsyncedCount();
            const size = await this.getDatabaseSize();
            const timeSinceLastSend = Date.now() - this.lastSendTime;
            const timeRemaining = Math.max(0, this.BATCH_SEND_INTERVAL - timeSinceLastSend);

            return {
                unsyncedCount: unsynced,
                databaseSize: size,
                lastSendTime: this.lastSendTime,
                timeUntilNextSend: timeRemaining,
                timeUntilNextSendMinutes: Math.floor(timeRemaining / 60000)
            };
        } catch (error) {
            console.error('Failed to get stats:', error);
            return null;
        }
    }

    /**
     * Clear all data (for testing)
     */
    async clearAllData() {
        try {
            await this.db.runAsync('DELETE FROM vitals');
            console.log('All vitals cleared');
        } catch (error) {
            console.error('Failed to clear data:', error);
        }
    }

    /**
     * Close database connection
     */
    async close() {
        if (this.db) {
            await this.db.closeAsync();
            console.log('Database closed');
        }
    }
}

export default new DatabaseService();