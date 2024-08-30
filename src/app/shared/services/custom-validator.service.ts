import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
@Injectable({
  providedIn: 'root',
})
export class CustomValidatorService {
  public mismatched(targetControl: AbstractControl): ValidatorFn {
    return (sourceControl: AbstractControl): ValidationErrors | null => {
      const targetVal = targetControl.value;
      const sourceVal = sourceControl.value;
      if (sourceVal === '') {
        return null;
      }
      return targetVal === sourceVal ? null : { mismatched: true };
    };
  }
  public endDateInvalid(targetControl: AbstractControl): ValidatorFn {
    return (sourceControl: AbstractControl): ValidationErrors | null => {
      const startDate = targetControl.value;
      const endDate = sourceControl.value;
      if (endDate === '') {
        return null;
      }
      return startDate < endDate ? null : { invalidDate: true };
    };
  }
  public startDateInvalid(targetControl: AbstractControl): ValidatorFn {
    return (sourceControl: AbstractControl): ValidationErrors | null => {
      const endDate = targetControl.value;
      const startDate = sourceControl.value;
      if (endDate === '') {
        return null;
      }
      return startDate > endDate ? { invalidDate: true } : null;
    };
  }
}
