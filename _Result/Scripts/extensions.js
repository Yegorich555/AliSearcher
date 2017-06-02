angular
    .module('myApp')
    .run(extensions)

function extensions() {
    Array.prototype.extend = function(other_array) {
        other_array.forEach(function(v) { this.push(v) }, this);
    }

    Array.prototype.sum = function(prop) {
        var total = 0
        for (var i = 0, _len = this.length; i < _len; i++) {
            total += this[i][prop]
        }
        return total;
    }
};