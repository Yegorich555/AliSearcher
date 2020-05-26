// converting validations to functions
export default function UnifyValidations(propsValidations, defaultValidations) {
  if (propsValidations != null) {
    const result = {};
    Object.keys(propsValidations).forEach(key => {
      const propsV = propsValidations[key];
      if (propsV === false) {
        return;
      }

      const defaultFn = defaultValidations[key];
      if (!defaultFn) {
        result[key] = propsV;
      } else if (typeof propsV === "function") {
        result[key] = v => propsV(v, undefined, defaultFn);
      } else {
        // propsV is setValue
        result[key] = (value, _setV, defFn) => defaultFn(value, propsV, defFn);
      }
    });
    return result;
  }

  return null;
}
