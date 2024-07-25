import React from "react";
import { CustomInput, TextFieldContainer, LabelTypo, CustomBox } from "./style";
import { IconButton, Input, InputAdornment } from "@mui/material";
import { Controller } from "react-hook-form";

const MuiInput = ({
  name,
  control,
  type = "text",
  label = EMPTY_STRING,
  variant = "standard",
  placeholder,
  isPassword,
  onChangeFileInput,
  InputProps,
  multiline,
  labelField, 
  asterisk,
  isRevenue,
  startSymbol,
  endSymbol,
  endAdornment,
  onStartClick,
  onEndClick,
  ...props
}) => {
  const asteriskIcon = asterisk ? EMPTY_STRING : <CustomBox>*</CustomBox>;
  return (
    <TextFieldContainer>
      {labelField && (
        <LabelTypo>
          {labelField}
          {asteriskIcon}
        </LabelTypo>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value } }) => (
          <CustomInput
            labelField={labelField}
            type={type}
            fullWidth
            label={label}
            variant={variant}
            placeholder={placeholder}
            value={value}
            onChange={type === "file" ? onChangeFileInput : onChange}
            multiline={multiline}
            {...props}
            InputProps={
              !multiline &&
              (InputProps ?? {
                inputComponent: Input,
                  startAdornment: startSymbol && (
                    <InputAdornment position="start">
                      <IconButton onClick={onStartClick} size="small">
                      {startSymbol}
                      </IconButton>
                    </InputAdornment>
                  ),
                  endAdornment: endSymbol && (
                    <InputAdornment position="end">
                      <IconButton onClick={onEndClick} size="small">
                        {endSymbol}
                      </IconButton>
                    </InputAdornment>
                  )
                   })
            }
          />
        )}
      />
    </TextFieldContainer>
  );
};

export default MuiInput;
