export function setLocalStorage(key, value) {
    try {
        const serializedValue = JSON.stringify(value);
        window.localStorage.setItem(key, serializedValue);
    } catch (error) {
        console.error("Error saving to local storage", error);
    }
}

export function getLocalStorage(key) {
    try {
        const serializedValue = window.localStorage.getItem(key);
        return serializedValue ? JSON.parse(serializedValue) : null;
    } catch (error) {
        console.error("Error reading from local storage", error);
        return null;
    }
}

export function clearLocalStorage(keys, values) {
    window.localStorage.setItem(keys.isLoggined, values.isLoggined);
    window.localStorage.setItem(keys.user, values.user);
    window.localStorage.setItem(keys.token, values.token);
}