(function(exports){

    const object_manager = (obj) => {
        return {
            get:(propname) => propname === undefined ? obj : obj[propname],
            set:(propname,value) => obj[propname] = value,
            clear:(propname) => propname === undefined ? Object.keys(obj).forEach(key=>delete obj[key]) : delete obj[propname],
            merge:(part) => obj = Object.assign(obj, part),
        }
    }

   exports.object_manager = object_manager

})(typeof exports === 'undefined'? this['utils']={}: exports);