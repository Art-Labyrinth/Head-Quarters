import { useNavigate } from 'react-router-dom';
import { Formik } from 'formik';
import { FormikHelpers } from 'formik/dist/types';
import * as Yup from 'yup';

import { useUserStore } from '../../../entities/user';
import type { LoginForm as LoginFormType } from './types';

export function LoginForm() {
  const navigate = useNavigate();
  const { login, loginRedirect } = useUserStore();

  const initialValues: LoginFormType = {
    username: '',
    password: '',
    submit: null,
  };

  const yupValidationSchema = Yup.object().shape({
    username: Yup.string()
        .max(255, "Email must be at most 255 characters")
        .required("The email field is required"),
    password: Yup.string()
        .max(255, "Password must be at most 255 characters")
        .required("The password field is required"),
  });

  const formikOnSubmitAction = async (values: LoginFormType, { setErrors, setStatus, setSubmitting }: FormikHelpers<LoginFormType>) => {
    try {
      const { username, password } = values;
      const sendValues = {
        ...(username && { username }),
        ...(password && { password }),
      };

      login(sendValues);
      setStatus({ success: true });
      navigate(loginRedirect);
    } catch (error: unknown) {
      let errorMessage = 'An unknown error occurred';
      if (Array.isArray(error)) {
        errorMessage = error.join('|');
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      setErrors({ submit: errorMessage });
      setStatus({ success: false });
    } finally {
      setSubmitting(false);
    }
  };

  return (
      <Formik
          initialValues={initialValues}
          validationSchema={yupValidationSchema}
          onSubmit={formikOnSubmitAction}
      >
        {({
            errors,
            handleBlur,
            handleChange,
            handleSubmit,
            isSubmitting,
            touched,
            values,
          }) => (
            <form noValidate onSubmit={handleSubmit} className="space-y-6">
              {/* Logo */}
              <div className="flex justify-center mb-4">
                <img src="/images/logo.png" alt="Logo" className="h-12" />
              </div>

              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                    id="username"
                    name="username"
                    type="text"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.username}
                    className={`mt-1 p-2 block w-full rounded-md border ${
                        touched.username && errors.username ? 'border-red-500' : 'border-gray-300'
                    } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.password}
                    className={`mt-1 p-2 block w-full rounded-md border ${
                        touched.password && errors.password ? 'border-red-500' : 'border-gray-300'
                    } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                />
              </div>

              {/* Error Display */}
              {touched.submit && Object.keys(errors).length > 0 && (
                  <div className="rounded-md bg-red-100 p-4 text-sm text-red-700 space-y-2">
                    {errors.username && touched.username && <div>{errors.username}</div>}
                    {errors.password && touched.password && <div>{errors.password}</div>}
                    {errors.submit && touched.submit && (
                        <div className="space-y-1">
                          {errors.submit.split('|').map((item: string) => (
                              <div key={item}>{item}</div>
                          ))}
                        </div>
                    )}
                  </div>
              )}

              {/* Submit Button */}
              <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex justify-center items-center px-4 py-2 text-white text-sm font-medium rounded-md transition ${
                      isSubmitting ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
              >
                {isSubmitting && (
                    <svg
                        className="animate-spin h-5 w-5 mr-2 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                      <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                      />
                      <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                )}
                Login
              </button>
            </form>
        )}
      </Formik>
  );
}
