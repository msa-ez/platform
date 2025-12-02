const HashUtil = require("./HashUtil");

const DB_NAME = 'ai-cache-db';
const STORE_NAME = 'ai-cache-store';
const KEY_PREFIX = 'ai-cache-';
const DB_VERSION = 1;

let db;

class AICacheUtil {   
    static async set(requestMessage, value, tag = "default") {
        const key = AICacheUtil._getKey(requestMessage);
        const db = await AICacheUtil._openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put({ key, value, tag });
    
            request.onsuccess = () => {
                resolve();
            };
    
            request.onerror = (event) => {
                console.error("IndexedDB set error:", event.target.error);
                reject(event.target.error);
            };
        });
    }
    
    static async get(requestMessage) {
        const key = AICacheUtil._getKey(requestMessage);
        const db = await AICacheUtil._openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(key);
    
            request.onsuccess = () => {
                const value = request.result ? request.result.value : null
                resolve(value);
            };
    
            request.onerror = (event) => {
                console.error("IndexedDB get error:", event.target.error);
                reject(event.target.error);
            };
        });
    }

    static async clearAll() {
        const db = await AICacheUtil._openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.clear();
    
            request.onsuccess = () => {
                console.log("All cache cleared successfully");
                resolve();
            };
    
            request.onerror = (event) => {
                console.error("IndexedDB clearAll error:", event.target.error);
                reject(event.target.error);
            };
        });
    }

    static async clearByTag(searchTag) {
        const db = await AICacheUtil._openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.openCursor();
            
            let deletedCount = 0;
    
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    const tag = cursor.value.tag;
                    if (tag === searchTag) {
                        cursor.delete();
                        deletedCount++;
                    }
                    cursor.continue();
                } else {
                    console.log(`Cache cleared: ${deletedCount} items with tag "${searchTag}"`);
                    resolve(deletedCount);
                }
            };
    
            request.onerror = (event) => {
                console.error("IndexedDB clearByTag error:", event.target.error);
                reject(event.target.error);
            };
        });
    }

    static _getKey(requestMessage) {
        return KEY_PREFIX + HashUtil.generateHashKey(requestMessage);
    }

    static async _openDB() {
        return new Promise((resolve, reject) => {
            if (db) {
                return resolve(db);
            }
    
            const request = indexedDB.open(DB_NAME, DB_VERSION);
    
            request.onerror = (event) => {
                console.error("IndexedDB error:", event.target.error);
                reject("IndexedDB error");
            };
    
            request.onsuccess = (event) => {
                db = event.target.result;
                resolve(db);
            };
    
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'key' });
                }
            };
        });
    }
}

module.exports = AICacheUtil;