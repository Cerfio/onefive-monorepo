const generateNumberInRange = (min: number, max: number) => {
    if (min > max) {
        throw new Error('Min value cannot be greater than max value');
    }
    const result = Math.floor(Math.random() * (max - min + 1)) + min;
    return result;
}

export default generateNumberInRange;