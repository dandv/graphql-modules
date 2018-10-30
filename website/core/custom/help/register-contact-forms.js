// Utils taken directly for the utils module to save the hustle
const validateEmail = (ctx, str) => {
  if (
    typeof str !== 'string' &&
    !(str instanceof String)
  ) {
    throw TypeError(`${ctx} must be a string`)
  }

  validateLength(ctx, str, 5, 30)

  if (!/^[\w.-]+@[\w.-]+\.\w+$/.test(str)) {
    throw TypeError(`${ctx} is not an email address`)
  }
}

const validateLength = (ctx, str, ...args) => {
  let min, max

  if (args.length === 1) {
    min = 0
    max = args[0]
  }
  else {
    min = args[0]
    max = args[1]
  }

  if (
    typeof str !== 'string' &&
    !(str instanceof String)
  ) {
    throw TypeError(`${ctx} must be a string`)
  }

  if (str.length < min) {
    throw TypeError(`${ctx} must be at least ${min} chars long`)
  }

  if (str.length > max) {
    throw TypeError(`${ctx} must contain ${max} chars at most`)
  }
}

// Since Docosaurus uses SSR to render static HTML, we'll need to use native events
// unless we wanna load React and wrap that goddamn thing
class ContactFormController extends HTMLDivElement {
  static inject(self) {
    self.__proto__ = ContactFormController.prototype
    self.nameInput = self.querySelector('._name input')
    self.emailInput = self.querySelector('._email input')
    self.detailsInput = self.querySelector('._details textarea')
    self.sendButton = self.querySelector('._send-button')
    self.errorMessage = self.querySelector('._error-message')
    self.send = self.send.bind(self)
    self.sending = false
  }

  get sending() {
    return this._sending
  }

  set sending(sending) {
    if (this._sending === sending) return sending

    this.errorMessage.innerHTML = ''

    if (sending) {
      this._sending = true
      this.sendButton.classList.add('_sending')
      this.sendButton.innerHTML = 'Sending...'
      this.sendButton.removeEventListener('click', this.send)
    }
    else {
      this._sending = false
      this.sendButton.classList.remove('_sending')
      this.sendButton.innerHTML = 'Send'
      this.sendButton.addEventListener('click', this.send)
    }

    return sending
  }

  validateFields() {
    try {
      validateLength('Name', this.nameInput.value, 3, 50)
    }
    catch (e) {
      this.errorMessage.innerHTML = e.message

      return false
    }

    try {
      validateEmail('Email', this.emailInput.value)
    }
    catch (e) {
      this.errorMessage.innerHTML = e.message

      return false
    }

    try {
      validateLength('Details', this.detailsInput.value, 10, 1000)
    }
    catch (e) {
      this.errorMessage.innerHTML = e.message

      return false
    }

    return true
  }

  send() {
    if (this.sending) return
    if (!this.validateFields()) return

    this.sending = true

    fetch('/.netlify/functions/contact', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: this.nameInput.value,
        email: this.emailInput.value,
        details: this.detailsInput.value,
      }),
    }).then((res) => {
      if (res.status >= 400) {
        swal({
          title: 'Oy vey...',
          text: 'Message wasn\'t sent due to internal server error :-(',
          type: 'error',
        })
      }
      else {
        swal({
          title: 'Thank you for getting in touch!',
          text: 'We\'ll contact you shortly :-)',
          type: 'success',
        })
      }

      this.sending = false
      this.nameInput.value = ''
      this.emailInput.value = ''
      this.detailsInput.value = ''
    }).catch(() => {
      this.sending = false
    })
  }
}

document.querySelectorAll('.ContactForm').forEach((contactForm) => {
  ContactFormController.inject(contactForm)
})