/* global google */

// Common modules
import '../../../common'

const browser = require('../../../browser')
const endpoints = require('../../../api')
const getApiData = require('../../../get-api-data')
const querystring = require('../../../get-url-parameter')
const templating = require('../../../template-render')
const marked = require('marked')
marked.setOptions({sanitize: true})
const htmlEncode = require('htmlencode')

const initMap = () => {
  const centre = { lat: address.latitude, lng: address.longitude }
  const map = new google.maps.Map(document.querySelector('.js-map'), {
    zoom: 15,
    center: centre
  })

  new google.maps.Marker({ // eslint-disable-line
    position: centre,
    map: map
  })
}

const clean = (str) => {
  return marked(htmlEncode.htmlDecode(str))
}

const onRenderCallback = () => {
  browser.loaded()
  initMap()
}

const formatGeneralInfo = (data) => {
  ['synopsis', 'description']
    .forEach((f) => {
      data[f] = clean(data[f])
    })
  return data
}

const formatContactInformation = (data) => {
  ['additionalInfo']
    .forEach((f) => {
      data[f] = clean(data[f])
    })
  return data
}

const formatAddress = (addressObj) => {
  const addressParts = ['street1', 'street2', 'street3', 'city']
  const formattedAddress = addressParts
    .filter((p) => addressObj[p])
    .map((p) => addressObj[p].trim())
    .filter((p) => p.length > 0)
    .join(', ')
  return `${formattedAddress}. ${addressObj.postcode}`
}

const formatFeatures = (features) => {
  const keys = [
    'acceptsPets',
    'hasDisabledAccess',
    'hasSingleRooms',
    'hasSharedRooms',
    'hasShowerBathroomFacilities',
    'hasAccessToKitchen',
    'hasFlexibleMealTimes',
    'hasLounge',
    'hasLaundryFacilities',
    'providesCleanBedding',
    'allowsVisitors']
  keys
    .forEach((f) => {
      features[f] = features[f] === 1
    })
  features.additionalFeatures = clean(features.additionalFeatures)
  features.hasIndividualFeatures = keys.filter((k) => features[k] === true).length > 0
  features.hasContent = features.hasIndividualFeatures || features.additionalFeatures.length > 0

  return features
}

const formatPricingAndReqs = (data) => {
  if (!data) return

  const textContentFields = ['featuresAvailableAtAdditionalCost', 'referralNotes', 'availabilityOfMeals']

  data.foodIsIncluded = data.foodIsIncluded === 1
  data.referralNotes = clean(data.referralNotes)
  data.featuresAvailableAtAdditionalCost = clean(data.featuresAvailableAtAdditionalCost)
  data.availabilityOfMeals = clean(data.availabilityOfMeals)
  data.hasContent = data.foodIsIncluded || textContentFields.filter((f) => data[f].length > 0).length > 0

  return data
}

const formatSupportProvided = (data) => {
  if (!data) return
  const supportTypes = [
    { key: 'alcohol', name: 'Alcohol' },
    { key: 'domestic violence', name: 'Domestic Violence' },
    { key: 'mental health', name: 'Mental Health' },
    { key: 'physical health', name: 'Physical Health' },
    { key: 'substances', name: 'Drug Dependency' }
  ]
  data.supportOffered = data.supportOffered
    .map((s) => supportTypes.find(kv => kv.key === s).name)
  data.supportInfo = clean(data.supportInfo)
  data.hasContent = data.supportOffered.length > 0 || data.supportInfo.length > 0 || data.hasOnSiteManager
  return data
}

const formatResidentCriteria = (data) => {
  if (!data) return

  data.hasContent = Object.keys(data).filter((k) => data[k] === true).length > 0

  return data
}

browser.loading()

let address = {}

getApiData
  .data(`${endpoints.accommodation}/${querystring.parameter('id')}`)
  .then((result) => {
    result.data.address.formattedAddress = formatAddress(result.data.address)
    result.data.contactInformation = formatContactInformation(result.data.contactInformation)
    result.data.generalInfo = formatGeneralInfo(result.data.generalInfo)
    result.data.features = formatFeatures(result.data.features)
    result.data.pricingAndRequirements = formatPricingAndReqs(result.data.pricingAndRequirements)
    result.data.supportProvided = formatSupportProvided(result.data.supportProvided)
    result.data.residentCriteria = formatResidentCriteria(result.data.residentCriteria)

    address = result.data.address

    templating.renderTemplate('js-template', result.data, 'js-template-placeholder', onRenderCallback)
  }, (e) => {
    browser.redirect('/500')
  })
