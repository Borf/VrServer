const ALLOWED_ROT_DIFF = 0.001;
const ALLOWED_POS_DIFF = 0.001;

module.exports = class Node {
    constructor(id, position, rotation) {
        this.id = id;
        this.position = position;
        this.rotation = rotation;
    }

    compare(other) {
        for (let i = 0; i < 4; i++) {
            // Compare rotation
            let rotDiff = this.rotation[i] - other.rotation[i];
            if (rotDiff < 0) {
                rotDiff *= -1;
            }

            if (rotDiff > ALLOWED_ROT_DIFF) {
                return false;
            }
            
            // Compare position
            if (i == 4) {
                return true;
            }
            let posDiff = this.position[i] - other.position[i];
            if (posDiff < 0) {
                posDiff *= -1;
            }

            if (posDiff > ALLOWED_POS_DIFF) {
                return false;
            }
        }

        return true;
    }
};
