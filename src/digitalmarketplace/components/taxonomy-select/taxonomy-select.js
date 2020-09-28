function TaxonomySelect ($module) {
  this.$taxonomySelect = $module
  this.$options = this.instantiateOptions()
  this.$taxonomyContainer = this.$taxonomySelect.querySelector('.js-taxonomy-container')
}
  
TaxonomySelect.prototype.init = function () {
  // Attach listener to update options
  this.$taxonomySelect.addEventListener('change', function (event) {
    var $changedEl = event.target
    console.log($changedEl)
    if ($changedEl.tagName === 'SELECT') {
      this.update()
    }
  }.bind(this))

  // Replace div.container-head with a button
  this.replaceHeadingSpanWithButton()

  // Add js-collapsible class to parent for CSS
  this.$taxonomySelect.classList.add('js-collapsible')

  // Add open/close listeners
  this.$taxonomySelect.querySelector('.js-container-button').addEventListener('click', this.toggleTaxonomySelect.bind(this))
  if (this.$taxonomySelect.dataset.closedOnLoad === 'true') {
    this.close()
  } else {
    this.open()
  }

  this.update()
}

TaxonomySelect.prototype.update = function updateTaxonomyFacet () {
  this.disableLevel2Taxon()
  this.disableLevel3Taxon()
  this.resetLevel2TaxonValue()
  this.resetLevel3TaxonValue()
  this.showRelevantLevel2Taxons()
  this.showRelevantLevel3Taxons()
}

TaxonomySelect.prototype.disableLevel2Taxon = function disableLevel2Taxon () {
  var level1TaxonSelected = !!this.$level1Taxon().value
  this.$level2Taxon().disabled = !level1TaxonSelected
}

TaxonomySelect.prototype.disableLevel3Taxon = function disableLevel3Taxon () {
  var level2TaxonSelected = !!this.$level2Taxon().value
  this.$level3Taxon().disabled = !level2TaxonSelected
}

TaxonomySelect.prototype.resetLevel2TaxonValue = function resetLevel2TaxonValue () {
  var selected = this.$level2Taxon().querySelector('option:checked')

  var parentTaxon = this.$level1Taxon().value

  var isOrphanedSubTaxon = selected && selected.dataset.parent !== parentTaxon

  if (isOrphanedSubTaxon) {
    this.$level2Taxon().value = ''
  }
}

TaxonomySelect.prototype.resetLevel3TaxonValue = function resetLevel3TaxonValue () {
  var selected = this.$level3Taxon().querySelector('option:checked')

  var parentTaxon = this.$level2Taxon().value

  var isOrphanedSubTaxon = selected && selected.dataset.parent !== parentTaxon

  if (isOrphanedSubTaxon) {
    this.$level3Taxon().value = ''
  }
}

TaxonomySelect.prototype.showRelevantLevel2Taxons = function showRelevantLevel2Taxons () {
  if (this.$level1Taxon().value !== '') {
    var taxons = this.$options[this.$level1Taxon().value]
  
    var subtaxon = this.$level2Taxon()
  
    subtaxon.querySelectorAll('option').forEach(function (option) {
      if (option.value) { option.remove() }
    }, this)

    taxons.forEach(function (option) {
      subtaxon.appendChild(option)
    }, this)
  }
}

TaxonomySelect.prototype.showRelevantLevel3Taxons = function showRelevantLevel3Taxons () {
  if (this.$level2Taxon().value !== '') {
    var taxons = this.$options[this.$level2Taxon().value]
  
    var subtaxon = this.$level3Taxon()
  
    subtaxon.querySelectorAll('option').forEach(function (option) {
      if (option.value) { option.remove() }
    }, this)

    taxons.forEach(function (option) {
      subtaxon.appendChild(option)
    }, this)
  }
}

TaxonomySelect.prototype.$level1Taxon = function $level1Taxon () {
  return this.$taxonomySelect.querySelector('#level_one_taxon')
}

TaxonomySelect.prototype.$level2Taxon = function $level2Taxon () {
  return this.$taxonomySelect.querySelector('#level_two_taxon')
}

TaxonomySelect.prototype.$level3Taxon = function $level3Taxon () {
  return this.$taxonomySelect.querySelector('#level_three_taxon')
}

TaxonomySelect.prototype.instantiateOptions = function instantiateOptions () {
  var options = {}

  this.level2Options = this.$level2Taxon().querySelectorAll('option[value]')
  this.level3Options = this.$level3Taxon().querySelectorAll('option[value]')

  this.level2Options.forEach(function (option) {
    var parent = option.dataset.parent

    if (parent) {
      options[parent] = options[parent] || []
      options[parent].push(option)
    }
  })
  
  this.level3Options.forEach(function (option) {
    var parent = option.dataset.parent

    if (parent) {
      options[parent] = options[parent] || []
      options[parent].push(option)
    }
  })
  console.log(options)

  return options
}

TaxonomySelect.prototype.replaceHeadingSpanWithButton = function replaceHeadingSpanWithButton () {
  /* Replace the span within the heading with a button element. This is based on feedback from Léonie Watson.
    * The button has all of the accessibility hooks that are used by screen readers and etc.
    * We do this in the JavaScript because if the JavaScript is not active then the button shouldn't
    * be there as there is no JS to handle the click event.
  */
  var $containerHead = this.$taxonomySelect.querySelector('.js-container-button')
  var jsContainerHeadHTML = $containerHead.innerHTML

  // Create button and replace the preexisting html with the button.
  var $button = document.createElement('button')
  $button.classList.add('js-container-button', 'dm-taxonomy-select__title', 'dm-taxonomy-select__button')
  // Add type button to override default type submit when this component is used within a form
  $button.setAttribute('type', 'button')
  $button.setAttribute('aria-expanded', true)
  $button.setAttribute('id', $containerHead.id)
  $button.setAttribute('aria-controls', this.$taxonomyContainer.id)
  $button.innerHTML = jsContainerHeadHTML
  $containerHead.insertAdjacentHTML('afterend', $button.outerHTML)
  $containerHead.remove()
}

TaxonomySelect.prototype.toggleTaxonomySelect = function toggleTaxonomySelect (e) {
  if (this.isClosed()) {
    this.open()
  } else {
    this.close()
  }
  e.preventDefault()
}

TaxonomySelect.prototype.open = function open () {
  if (this.isClosed()) {
    this.$taxonomySelect.querySelector('.js-container-button').setAttribute('aria-expanded', true)
    this.$taxonomySelect.classList.remove('js-closed')
    this.$taxonomySelect.classList.add('js-opened')
  }
}

TaxonomySelect.prototype.close = function close () {
  this.$taxonomySelect.classList.remove('js-opened')
  this.$taxonomySelect.classList.add('js-closed')
  this.$taxonomySelect.querySelector('.js-container-button').setAttribute('aria-expanded', false)
}

TaxonomySelect.prototype.isClosed = function isClosed () {
  return this.$taxonomySelect.classList.contains('js-closed')
}

export default TaxonomySelect
  