import styled from '@emotion/styled';
import { Box, TextField, Typography } from '@mui/material';

const CustomInput = styled(TextField)(({ theme, variant, labelField }) => ({
  fontFamily: 'Catamaran-Medium',
  padding: '4px 0px 0px 0px',
  fontWeight: 500,
  fontSize: 16,
  lineHeight: '26px',
  borderColor: theme.primary.main,
  minHeight: '50px',

  "& input[name=revenue]::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
    display: "none",
  },
  "& input[name=revenue]": {
    MozAppearance: "textfield",
  },

  '& input::placeholder': {
    fontFamily: 'Catamaran',
    color: `${theme.secondary.blackOpacity} !important`,
    fontWeight: 400,
    fontSize: 16,
    lineHeight: '26px',
    opacity: 1,
  },

  '& input': {
    padding: variant === 'outlined' ? '2px 0px' : '0px',
    fontFamily: 'Catamaran-Medium',
    fontWeight: 500,
    color: theme.primary.black
  },

  '& > div > div': {
    padding: variant === 'outlined' ? '10px 16px' : '10px 0',
  },

  '& .MuiOutlinedInput-root': {
    paddingRight:0,
    '&.Mui-focused': {
      backgroundColor: theme.primary.white,
      borderRadius: '10px',
      border: labelField? 'none' : `1px solid ${theme.primary.main} !important`
    },

    '&.Mui-disabled': {
      backgroundColor: theme.secondary.white,
      borderRadius: '10px',
      '& input': {
        WebkitTextFillColor: theme.secondary.whiteBlue400,
      },
    },

    '& fieldset': {
      borderColor: `${theme.secondary.whiteBlue200} !important`,
      borderRadius: '10px',
      minHeight: '49px',
    },
   
    '&:hover fieldset': {
      borderColor: theme.secondary.whiteBlue400,
    },
    '&.Mui-focused fieldset': {
      boxShadow: `0px 10px 20px 0px ${theme.secondary.blackGradient}`,
      border: `1px solid ${theme.secondary.purpleShade} !important`,
    },

    '& img': {
      display: 'none',
    },
  },

  '& .MuiSelect-select.MuiSelect-outlined': {
    padding: '12px 16px',
  },

  '& :before':
    variant === 'outlined'
      ? {
          border: 'none !important',
          outline: 'none !important',
        }
      : { 
        borderColor: theme.secondary.whiteBlue400,
        borderBottom: `1px solid #9D9D9D !important`
      },
  '& :after':
    variant === 'outlined'
      ? {
          border: 'none !important',
          outline: 'none !important',
        }
      : {
          outline: 'none !important',
          borderColor: `#1A197A !important`
        },

  [theme.breakpoints.down('sm')]: {
    fontSize: 14,
    '&:placeholder': {
      fontSize: 14,
    },
  },
}));

const TextFieldContainer = styled(Box)(({ theme }) => ({
  marginBottom: "0px",
  width: "100%",
  fontSize: '14px',
  label: {
    color: theme.primary.placeholderColor,
    paddingBottom: 4,
    fontSize: '14px',
  },
}));

const LabelTypo = styled(Typography)(({theme}) => ({
  fontFamily: "Catamaran-Medium",
  fontSize: '16px',
  color: theme.secondary.whiteBlue400,
  position: 'relative'
}))

const CustomBox = styled('sup')(({theme}) => ({
  color: theme.primary.red,
  fontSize: '15px',
  position: 'absolute'
}))

export { CustomInput, TextFieldContainer, LabelTypo, CustomBox };
