var Q = require('q')

var getLocation = function () {
  var deferred = Q.defer()
  var options = {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 5000
  }

  function success (position) {
    console.log('getlocation.location() success')
    deferred.resolve(position)
  }

  function error (error) {
    console.log('getlocation.location() error')
    deferred.reject(error)
  }

  navigator.geolocation.getCurrentPosition(success, error, options)

  return deferred.promise
}

let isAvailable = () => {
  if (navigator.geolocation) return true
  return false
}

module.exports = {
  location: getLocation,
  isAvailable: isAvailable
}
