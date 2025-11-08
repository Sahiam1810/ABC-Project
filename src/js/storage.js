export function write( dbName, data ){
    const dataString = JSON.stringify(data);
    localStorage.setItem(dbName, dataString);
}

export function read(dbName){
    const dataObject = localStorage.getItem(dbName);
    const data = dataObject == null ? [] : JSON.parse(dataObject);
    return data;
}