import { Input } from '@rneui/themed'
import React, { useEffect } from 'react'
import { useFormContext, Controller, RegisterOptions } from 'react-hook-form'
import { TextInput } from 'react-native'

type Props = React.ComponentProps<typeof TextInput> & {
  name: string
  rules: RegisterOptions
  validationLength?: number
  formatter?: (oldValue: string, newValue: string) => string
  onValid?: () => void
}

export const UIInput = React.forwardRef<TextInput, Props>((props, ref) => {
  const {
    name,
    rules,
    formatter,
    onValid,
    ...restOfProps
  } = props
  const { control } = useFormContext()
//   const value = watch(name)

  

//   useEffect(() => {
//     async function validate() {
//       const isValid = await trigger(name)
//       if (isValid) onValid?.()
//     }

//     if (value?.length >= validationLength) {
//       validate()
//     }
//   }, [value, name, validationLength, trigger]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Controller        
         control={control}        
         name={name}        
         render={({
             field: {onChange, value, onBlur, ref},
             fieldState: { isTouched, isDirty, error }
            }) => (            
           <Input 
           ref={ref}           
           placeholder="Enter your name here"
            value={value}
            onBlur={onBlur}
            onChangeText={(value) => onChange(value)}
            errorMessage={error?.message}    
           />        
         )}
         rules={rules}
         
          
    />

    // <Controller
    //   control={control}
    //   render={({ 
    //       field: { onChange, onBlur, value, name, ref },
    //       fieldState: { invalid, isTouched, isDirty, error },
    //     formState, 
    //   }) => (
    //     <Input
    //       {...restOfProps}
    //       ref={ref}
    //       testID={`TextField.${name}`}
    //       errorMessage={error?.message}
    //       onBlur={(event) => {
    //           debugger;
    //         onBlur()
    //       }}
    //       onChangeText={(text) => {
    //           debugger;
    //         const formatted = formatter ? formatter(value, text) : text
    //         onChange(formatted)
    //       }}
    //       value={value}
    //     />
    //   )}
    //   name={name}
    //   rules={rules}
    // />
  )
})


