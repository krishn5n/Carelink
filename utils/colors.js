export const getVitalColor = (value) => {
    if (value >= 0 && value < 5) {
        return '#4CAF50'; // Green
    } else if (value >= 5 && value < 7.5) {
        return '#FFC107'; // Yellow
    } else if (value >= 7.5) {
        return '#F44336'; // Red
    }
    return '#9E9E9E'; // Gray for invalid
};

export const getVitalStatus = (value) => {
    if (value >= 0 && value < 5) {
        return 'Normal';
    } else if (value >= 5 && value < 7.5) {
        return 'Warning';
    } else if (value >= 7.5) {
        return 'Critical';
    }
    return 'Unknown';
};