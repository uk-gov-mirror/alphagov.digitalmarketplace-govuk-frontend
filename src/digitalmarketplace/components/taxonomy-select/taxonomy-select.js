function TaxonomySelect ($module) {
  this.$taxonomySelect = $module
  this.$taxonomyContainer = this.$taxonomySelect.querySelector('.js-taxonomy-container')
  this.taxonDepth = this.$taxonomySelect.querySelectorAll('.js-taxonomy-select').length
  this.$options = this.instantiateOptions()
}

TaxonomySelect.prototype.init = function () {
  // Attach listener to update options
  this.$taxonomySelect.addEventListener('change', function (event) {
    var $changedEl = event.target
    if ($changedEl.tagName === 'SELECT') {
      this.update()
      this.updateSelectedCount()
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

  var selectedString = this.selectedString()
  if (selectedString) {
    this.attachSelectedCounter(selectedString)
  }

  this.update()
}

TaxonomySelect.prototype.$taxonAtLevel = function $taxonLevel (level) {
  return this.$taxonomySelect.querySelector('#level_' + level + '_taxon')
}

TaxonomySelect.prototype.disableSubTaxons = function disableSubTaxons () {
  for (var i = 1; i < this.taxonDepth; i++) {
    var parentTaxonSelected = !!this.$taxonAtLevel(i).value && !this.$taxonAtLevel(i).disabled
    this.$taxonAtLevel(i + 1).disabled = !parentTaxonSelected
  }
}

TaxonomySelect.prototype.resetSubTaxons = function resetSubTaxons () {
  for (var i = 1; i < this.taxonDepth; i++) {
    var selected = this.$taxonAtLevel(i + 1).querySelector('option:checked')

    var parentTaxon = this.$taxonAtLevel(i).value

    var isOrphanedSubTaxon = selected && selected.dataset.parent !== parentTaxon

    if (isOrphanedSubTaxon) {
      this.$taxonAtLevel(i + 1).value = ''
    }
  }
}

TaxonomySelect.prototype.showRelevantSubTaxons = function showRelevantSubTaxons () {
  for (var i = 1; i < this.taxonDepth; i++) {
    if (this.$taxonAtLevel(i).value !== '') {
      var taxons = this.$options[this.$taxonAtLevel(i).value]
      var subtaxon = this.$taxonAtLevel(i + 1)

      subtaxon.querySelectorAll('option').forEach(function (option) {
        if (option.value) { option.remove() }
      }, this)

      taxons.forEach(function (option) {
        subtaxon.appendChild(option)
      }, this)
    }
  }
}

TaxonomySelect.prototype.update = function updateTaxonomyFacet () {
  this.disableSubTaxons()
  this.resetSubTaxons()
  this.showRelevantSubTaxons()
}

TaxonomySelect.prototype.instantiateOptions = function instantiateOptions () {
  var options = {}

  for (var i = 1; i <= this.taxonDepth; i++) {
    this.subTaxonOptions = this.$taxonAtLevel(i).querySelectorAll('option[value]')
    this.subTaxonOptions.forEach(function (option) {
      var parent = option.dataset.parent

      if (parent) {
        options[parent] = options[parent] || []
        options[parent].push(option)
      }
    })
  }

  return options
}

/* Below this line are methods for handling the expander. These could be separated out if necessary. */

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

TaxonomySelect.prototype.attachSelectedCounter = function attachSelectedCounter (selectedString) {
  this.$taxonomySelect.querySelector('.js-container-button')
    .insertAdjacentHTML('afterend', '<div class="dm-taxonomy-select__selected-counter js-selected-counter">' + selectedString + '</div>')
}

TaxonomySelect.prototype.updateSelectedCount = function updateSelectedCount () {
  var selectedString = this.selectedString()
  var selectedStringElement = this.$taxonomySelect.querySelector('.js-selected-counter')

  if (selectedString) {
    if (selectedStringElement) {
      selectedStringElement.textContent = selectedString
    } else {
      this.attachSelectedCounter(selectedString)
    }
  } else {
    selectedStringElement.remove()
  }
}

TaxonomySelect.prototype.selectedString = function selectedString () {
  this.getSelectedNumber()
  var count = this.selectedCount
  var selectedString = false
  if (count > 0) {
    selectedString = count + ' selected'
  }

  return selectedString
}

TaxonomySelect.prototype.getSelectedNumber = function getSelectedNumber () {
  this.selectedCount = 0
  for (var i = 1; i <= this.taxonDepth; i++) {
    var selected = this.$taxonAtLevel(i).value != ''
    if (selected) { this.selectedCount++ }
  }
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
