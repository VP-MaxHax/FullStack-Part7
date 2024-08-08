import { useState } from 'react'


export const useField = (type) => {
  const [value, setValue] = useState('')

  const onChange = (event) => {
    if (event) {
      setValue(event.target.value)
    } else {
      setValue(event)
    }
  }

  return {
    type,
    value,
    onChange
  }
}

// moduulissa voi olla monta nimettyä eksportia

export const useAnotherHook = () => {
  // ...
}