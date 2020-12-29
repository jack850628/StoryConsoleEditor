class OldDriver {
    constructor () {
      this.driver = document.createElement('bus')
    }
  
    $on (event, callback) {
      this.driver.addEventListener(event, callback, false)
    }
  
    $off (event, callback) {
      this.driver.removeEventListener(event, callback, false)
    }
  
    $emit (event, payload = {}) {
      this.driver.dispatchEvent(new CustomEvent(event, { detail: payload }))
    }
  }
  
  export default new OldDriver();

  export const EVENT = {
    UPDATE_STORY_FILE: {
      NAME: 'UPDATE_STORY_FILE',
      TYPE: {
        ADD: 'ADD',
        EDIT_NAME: 'EDIT_NAME',
        DELETE: 'DELETE',
      }
    },
    UPDATE_VARIABLE: {
      NAME: 'UPDATE_VARIABLE',
      TYPE: {
        
      }
    }
  };