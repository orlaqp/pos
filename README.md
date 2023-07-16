

# Pos

## Specifications

- NodeJS: 16.13.0
- Release always go to main branch



## Packages

- UI Library: https://github.com/react-native-elements/react-native-elements 
- Icons: https://github.com/oblador/react-native-vector-icons 
- Star Printers: https://github.com/infoxicator/react-native-star-prnt
- Numeric control: https://www.npmjs.com/package/react-native-numeric-input
- Charts: https://github.com/indiespirit/react-native-chart-kit
- Device info: https://github.com/react-native-device-info/react-native-device-info

## Clone Amplify to another account

Follow these steps to clone all the aws resources in the new account:

in the original dev box, push the project to a codebase repo, respect what's in the .gitignore file.
in the dev box that you are going to use the new account for development, set up the user credentials by executing amplify config, and create a profile named 'newAccountProfile`.
pull down the codebase from the repo, remove the file amplify/team-provider-info.json file.
execute amplify init and when prompted, select the 'newAccountProfile` profile.
execute amplify push
Or if you just want to access the same resources in the original account from another account, set up an IAM role for that, you can follow this document.

## Barcode lookup service
 ### https://upcdatabase.org/

curl --location --request GET 'https://api.upcdatabase.org/product/073430005044?apikey=885046B131E08FC47ADF08D42C2EA493'
curl --location --request GET 'https://api.upcdatabase.org/product/04963406?apikey=885046B131E08FC47ADF08D42C2EA493'
