import * as React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  OutlinedInput,
  TextField,
  Typography,
  Autocomplete,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Divider,
  Button,
} from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

interface CustomFieldRendererProps {
  field: any;
  control: any;
  fieldName: string;
  customFormSettings?: any;
}

export const CustomFieldRenderer: React.FC<CustomFieldRendererProps> = ({
  field,
  control,
  fieldName,
  customFormSettings,
}) => {
  const { formState: { errors } } = useFormContext();

  // Get the error for this specific field from form errors
  const fieldError = React.useMemo(() => {
    const fieldPath = fieldName.split('.');
    let errorObj = errors;
    for (const path of fieldPath) {
      if (errorObj && typeof errorObj === 'object' && path in errorObj) {
        errorObj = (errorObj as any)[path];
      } else {
        return null;
      }
    }
    return errorObj as any;
  }, [errors, fieldName]);

  const renderFieldContent = () => {
    switch (field.type) {
      case 'heading':
        return (
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: 'primary.main',
                borderBottom: '2px solid',
                borderColor: 'primary.light',
                pb: 1,
                mb: 2
              }}
            >
              {field.title || field.label}
            </Typography>
          </Box>
        );
      case 'divider':
        return (
          <Box sx={{ my: 3 }}>
            <Divider
              sx={{
                borderColor: 'grey.300',
                borderWidth: 1
              }}
            />
          </Box>
        );
      case 'dropdown':
        return (
          <Controller
            key={field.id}
            control={control}
            name={fieldName}
            render={({ field: { onChange, value }, fieldState: { error } }) => {
              const hasError = !!(error || fieldError);
              return (
                <Box>
                  {field.question && (
                    <Typography variant="body1" sx={{ mb: 0.5, display: 'block', color: 'white' }}>
                      {field.question}{field.required && <span style={{ color: 'red' }}>*</span>}
                    </Typography>
                  )}
                  <Autocomplete
                    options={field.options || []}
                    value={value || ''}
                    onChange={(_, newValue) => onChange(newValue)}
                    freeSolo={false}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={
                          <>
                            {field.label}
                            {field.label && field.required && <span style={{ color: 'red', fontSize: '0.8em', verticalAlign: 'super' }}>*</span>}
                          </>
                        }
                        variant="outlined"
                        size="medium"
                        required={field.required}
                        error={hasError}
                        helperText={error?.message || fieldError?.message}
                        autoComplete="new-field"
                        slotProps={{
                          inputLabel: {
                            shrink: true,
                          },
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            color: 'white',
                            '& fieldset': {
                              borderColor: 'rgba(255, 255, 255, 0.3)',
                            },
                            '&:hover fieldset': {
                              borderColor: 'rgba(139, 92, 246, 0.5)',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#8b5cf6',
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: 'rgba(255, 255, 255, 0.7)',
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#8b5cf6',
                          },
                        }}
                      />
                    )}
                  />
                </Box>
              );
            }}
          />
        );
      case 'checkbox':
        return (
          <Controller
            key={field.id}
            control={control}
            name={fieldName}
            render={({ field: { onChange, value }, fieldState: { error } }) => {
              const hasError = !!(error || fieldError);
              return (
                <Box>
                  {field.label && <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      fontWeight: 500,
                      color: hasError ? 'error.main' : 'white'
                    }}
                  >
                    Q. {field.label} {field.required && <span style={{ color: 'red' }}>*</span>}
                  </Typography>}
                  {field.question && (
                    <Typography variant="body1" sx={{ mb: 1, display: 'block', color: 'white' }}>
                      {field.question}{field.required && <span style={{ color: 'red' }}>*</span>}
                    </Typography>
                  )}
                  <FormGroup>
                    {field.options?.map((option: string, optionIndex: number) => (
                      <FormControlLabel
                        key={optionIndex}
                        control={
                          <Checkbox
                            checked={Array.isArray(value) ? value.includes(option) : false}
                            color={hasError ? 'error' : 'primary'}
                            onChange={(e) => {
                              const currentValues = Array.isArray(value) ? value : [];
                              if (e.target.checked) {
                                onChange([...currentValues, option]);
                              } else {
                                onChange(currentValues.filter((v: string) => v !== option));
                              }
                            }}
                          />
                        }
                        label={option}
                        sx={{
                          color: hasError ? 'error.main' : 'white'
                        }}
                      />
                    ))}
                  </FormGroup>
                  {hasError && (
                    <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                      {error?.message || fieldError?.message || `${field.label} is required`}
                    </Typography>
                  )}
                </Box>
              );
            }}
          />
        );
      case 'date':
        return (
          <Controller
            key={field.id}
            control={control}
            name={fieldName}
            render={({ field: { onChange, value }, fieldState: { error } }) => {
              const hasError = !!(error || fieldError);
              return (
                <Box>
                  {field.question && (
                    <Typography variant="body1" sx={{ mb: 0.5, display: 'block', color: 'white' }}>
                      Q. {field.question}{field.required && <span style={{ color: 'red' }}>*</span>}
                    </Typography>
                  )}
                  <FormControl fullWidth error={hasError}>
                    {field.label && <InputLabel shrink sx={{ color: hasError ? 'error.main' : 'rgba(255, 255, 255, 0.7)' }}>
                      {field.label} {field.required && <span style={{ color: 'red' }}>*</span>}
                    </InputLabel>}
                    <OutlinedInput
                      type="date"
                      value={value || ''}
                      label={field.label}
                      onChange={onChange}
                      error={hasError}
                      autoComplete="new"
                      sx={{
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(139, 92, 246, 0.5)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#8b5cf6',
                        },
                      }}
                      inputProps={{
                        min: field.min || field.minDate || undefined,
                        max: field.max || field.maxDate || undefined,
                      }}
                    />
                    {hasError && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                        {error?.message || fieldError?.message || `${field.label} is required`}
                      </Typography>
                    )}
                  </FormControl>
                </Box>
              );
            }}
          />
        );
      case 'datetime':
        return (
          <Controller
            key={field.id}
            control={control}
            name={fieldName}
            render={({ field: { onChange, value }, fieldState: { error } }) => {
              const hasError = !!(error || fieldError);
              return (
                <Box>
                  {field.question && (
                    <Typography variant="body1" sx={{ mb: 0.5, display: 'block', color: 'white' }}>
                      Q. {field.question}{field.required && <span style={{ color: 'red' }}>*</span>}
                    </Typography>
                  )}
                  <FormControl fullWidth error={hasError}>
                    {field.label && <InputLabel shrink sx={{ color: hasError ? 'error.main' : 'rgba(255, 255, 255, 0.7)' }}>
                      {field.label} {field.required && <span style={{ color: 'red' }}>*</span>}
                    </InputLabel>}
                    <OutlinedInput
                      type="datetime-local"
                      sx={{
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(139, 92, 246, 0.5)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#8b5cf6',
                        },
                      }}
                      value={value || ''}
                      label={field.label}
                      onChange={onChange}
                      error={hasError}
                      autoComplete="new-field"
                      inputProps={{
                        step: field.step ?? 60,
                        min: field.min || field.minDateTime || field.min_datetime || undefined,
                        max: field.max || field.maxDateTime || field.max_datetime || undefined,
                      }}
                    />
                    {hasError && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                        {error?.message || fieldError?.message || `${field.label} is required`}
                      </Typography>
                    )}
                  </FormControl>
                </Box>
              );
            }}
          />
        );

      default:
        return (
          <Controller
            key={field.id}
            control={control}
            name={fieldName}
            render={({ field: { onChange, value }, fieldState: { error } }) => {
              const hasError = !!(error || fieldError);
              return (
                <Box>
                  {field.question && (
                    <Typography variant="body1" sx={{ mb: 0.5, display: 'block', color: 'white' }}>
                      Q. {field.question}{field.required && <span style={{ color: 'red' }}>*</span>}
                    </Typography>
                  )}
                  <FormControl fullWidth error={hasError}>
                    {field.label && <InputLabel shrink sx={{ color: hasError ? 'error.main' : 'rgba(255, 255, 255, 0.7)' }}>
                      {field.label} {field.label && field.required && <span style={{ color: 'red' }}>*</span>}
                    </InputLabel>}
                    <OutlinedInput
                      value={value || ''}
                      label={field.label}
                      onChange={onChange}
                      placeholder={field.placeholder}
                      error={hasError}
                      autoComplete="new-field"
                      sx={{
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(139, 92, 246, 0.5)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#8b5cf6',
                        },
                      }}
                    />
                    {hasError && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                        {error?.message || fieldError?.message || `${field.label} is required`}
                      </Typography>
                    )}
                  </FormControl>
                </Box>
              );
            }}
          />
        );
    }
  };

  return renderFieldContent();
};

// Hook for consistent custom field rendering
export const useCustomFieldRenderer = () => {
  const renderCustomField = (
    field: any,
    control: any,
    fieldName: string,
    customFormSettings?: any
  ) => {
    return (
      <CustomFieldRenderer
        field={field}
        control={control}
        fieldName={fieldName}
        customFormSettings={customFormSettings}
      />
    );
  };

  return { renderCustomField };
};