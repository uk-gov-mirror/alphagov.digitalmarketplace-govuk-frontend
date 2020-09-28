function TaxonomySelect ($module) {
  this.$taxonomySelect = $module
  this.$options = this.instantiateOptions
  this.$taxonomyContainer = this.$taxonomySelect.querySelector('.js-taxonomy-container')
}
  
TaxonomySelect.prototype.init = function () {
  // Attach listener to update checked count
  this.$taxonomySelect.addEventListener('change', function (event) {
    var $changedEl = event.target
    if ($changedEl.tagName === 'INPUT' && $changedEl.type === 'checkbox') {
      this.updateCheckedCount()
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

  this.allOptions = this.$taxonomySelect.querySelectorAll('option')

  this.allOptions.forEach(function (option) {
    var parent = option.dataset.parent

    options[parent] = options[parent] || []
    options[parent].push(option)
  })

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
  