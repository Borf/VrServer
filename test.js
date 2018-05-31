let str64 = 'xT0DAFKvvkSbPq5Hg3gZRlKvvkSbPq5Hg3gZRlKvvkSbPq5Hg3gZRoN4GUY=';

const updateData = {
    count: 1,
    requestNumber: 5,
    playerPosition: 'a4b2f180c5e26ddd',
    objects: 'xT0DAFKvvkSbPq5Hg3gZRlKvvkSbPq5Hg3gZRlKvvkSbPq5Hg3gZRoN4GUY='
};

const expected = [
    212421,
    1525.47879213,
    89213.2132,
    9822.12783,
    1525.47879213,
    89213.2132,
    9822.12783,
    1525.47879213,
    89213.2132,
    9822.12783,
    9822.12783
];

const result = [];

let buff = Buffer.from(str64, 'base64');

result.push(buff.readInt32LE(0));

for (let i = 0; i < expected.length - 1; i++) {
    let num = buff.readFloatLE(i * 4 + 4);
    result.push(num);
}

result.forEach(num => {
    console.log(num);
});
