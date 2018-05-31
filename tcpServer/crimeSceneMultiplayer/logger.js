const NO_LOG = "--no-log";

// The logger object which will be returned to from the module.
let Logger = {
    prefix: "[CrimeScene]",
    enabled: true,

    // Log any number of value to the console.
    log() {
        // Don't log if logging is disabled.
        if (!this.enabled) {
            return;
        }

        for (let i = 0; i < arguments.length; i++) {
            console.log(this.prefix, arguments[i]);
        }
    },

    setPrefix(newPrefix) {
        Logger.prefix = newPrefix;
    }
};

// Expose the function which will setup and return the logger.
module.exports = function () {
    if (process.argv.indexOf(NO_LOG) !== -1) {
        Logger.log("Logging disabled");
        Logger.enabled = false;            
    } else {
        Logger.enabled = true;
    }

    return Logger;
};
