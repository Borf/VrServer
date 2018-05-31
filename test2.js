let list = [];

let buff = Buffer.from('sdsad');
try {
    let num = buff.readInt32LE(2);
    console.log(num);
} catch(e) {
    console.log(e);
}
