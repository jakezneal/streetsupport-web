// Page modules
var FastClick = require('fastclick')
var nav = require('./nav.js')
var urlParameter = require('./get-url-parameter')
var accordion = require('./accordion')
var socialShare = require('./social-share')

// Lodash
var forEach = require('lodash/collection/forEach')
var find = require('lodash/collection/find')
var sortBy = require('lodash/collection/sortBy')
var slice = require('lodash/array/slice')

nav.init()
FastClick.attach(document.body)

// Load and process data
require.ensure(['./api', './get-api-data', './get-location', 'hogan.js', 'spin.js'], function (require) {
  var apiRoutes = require('./api')
  var getApiData = require('./get-api-data')
  var Hogan = require('hogan.js')
  var getLocation = require('./get-location')
  var Spinner = require('spin.js')

  // Spinner
  var spin = document.getElementById('spin')
  var loading = new Spinner().spin(spin)

  // Get category and create URL
  var theCategory = urlParameter.parameter('category')
  var theLocation = urlParameter.parameter('location')
  var categoryUrl = apiRoutes.categoryServiceProvidersByDay += theCategory

  var locations = [
    {
      'key': 'manchester',
      'name': 'Manchester',
      'longitude': -2.24455696347558,
      'latitude':53.4792777155671
    },
    {
      'key': 'leeds',
      'name': 'Leeds',
      'longitude': -1.54511238485298,
      'latitude':53.7954906003838
    }
  ]

  if (theLocation.length) {
    var requestedLocation = find(locations, function(loc) {
      return loc.key === theLocation
    })
  }

  if(requestedLocation !== false) {
    var latitude = requestedLocation.latitude
    var longitude = requestedLocation.longitude
    var locationUrl = categoryUrl += '/long/' + longitude + '/lat/' + latitude

    buildList(locationUrl)
  } else if (navigator.geolocation) {
    getLocation.location().then(function (position) {
      var latitude = position.coords.latitude
      var longitude = position.coords.longitude
      var locationUrl = categoryUrl += '/long/' + longitude + '/lat/' + latitude

      buildList(locationUrl)
    }).fail(function (error) {
      console.error('GEOLOCATION ERROR: ' + error)
      buildList(categoryUrl)
    })
  } else {
    buildList(categoryUrl)
  }

  function buildList (url) {
    // Get API data using promise
    getApiData.data(url).then(function (result) {
      // Append object name for Hogan
      var template = ''
      var callback = function () {}

      if (result.daysServices.length) {
        template = 'js-category-result-tpl'

        result.daysServices = sortByOpeningTimes(sortDaysFromToday(result.daysServices))

        callback = function () {
          accordion.init()
        }
      } else {
        template = 'js-category-no-results-result-tpl'
      }

      var theData = { organisations: result }
      renderTemplate(template, theData, 'js-category-result-output', callback)

      loading.stop()
      socialShare.init()
    })
  }

  function sortByOpeningTimes (days) {
    forEach(days, function (day) {
      day.serviceProviders = sortBy(day.serviceProviders, function (provider) {
        return provider.openingTimes.startTime
      })
    })

    return days
  }

  function sortDaysFromToday (days) {
    // api days: monday == 0!
    var today = new Date().getDay() - 1
    var past = slice(days, 0, today)
    var todayToTail = slice(days, today)
    return todayToTail.concat(past)
  }

  function renderTemplate (templateId, data, output, callback) {
    var theTemplate = document.getElementById(templateId).innerHTML
    var compileTemplate = Hogan.compile(theTemplate)
    document.getElementById(output).innerHTML = compileTemplate.render(data)
    callback()
  }
})
