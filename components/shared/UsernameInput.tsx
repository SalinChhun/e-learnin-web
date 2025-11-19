import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import "@/styles/custom.css";
import useUserMutation from "@/lib/hook/use-user-mutation";

import {
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
  FieldErrors,
  UseFormTrigger,
} from "react-hook-form";

// Define props interface
interface UsernameInputProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  name: string;
  trigger: UseFormTrigger<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
}

// Define ref interface
export interface UsernameInputRef {
  checkUsername: (value: string) => void;
}

const UsernameInput = forwardRef<UsernameInputRef, UsernameInputProps>(
  ({ register, errors, name, setValue, trigger, watch }, ref) => {
    const userMutation = useUserMutation.useUsernameCheck();
    const [isUnAvailable, setIsUnAvailable] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const [username, setUsername] = useState<string>("");

    // Watch for changes to the username field from outside
    const watchedUsername = watch(name);

    // When the username changes from outside (like when set from full name)
    useEffect(() => {
      if (watchedUsername !== username) {
        setUsername(watchedUsername || "");
        if (watchedUsername) {
          debouncedCheckUsername(watchedUsername);
        }
      }
    }, [watchedUsername]);

    // Expose the checkUsername method to parent components
    useImperativeHandle(ref, () => ({
      checkUsername: (value: string) => {
        setUsername(value);
        debouncedCheckUsername(value);
      },
    }));

    //TODO: Debounced API call function
    const debouncedCheckUsername = (value: string) => {
      //TODO: Clear any existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      //TODO: Reset state when starting a new check
      setIsUnAvailable(false);

      //TODO: Set a new timer
      debounceTimerRef.current = setTimeout(() => {
        //TODO: Only call the API if there's a value to check
        const isValidInput = /^[a-zA-Z0-9_]*$/.test(value);
        if (isValidInput) {
          console.log("Calling API for:", value);
          userMutation.mutation(value);
        }
      }, 500); // Wait for 500ms after the user stops typing
    };

    //TODO: Handle API success response (username is available)
    useEffect(() => {
      if (userMutation.data && (userMutation.data as any).status.code === 200) {
        //TODO: Username is available
        setIsUnAvailable(false);
        setSuggestions([]);
      }
    }, [userMutation.data]);

    //TODO: Handle API error response (username is not available)
    useEffect(() => {
      if (userMutation.isError) {
        //TODO: Username is not available (caught as an error)
        setIsUnAvailable(true);
        setSuggestions(userMutation?.apiError?.data);
      }
    }, [userMutation.isError]);

    //TODO: Reset availability when username is cleared
    useEffect(() => {
      if (!username) {
        setIsUnAvailable(false);
        setSuggestions([]);
      }
    }, [username]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      // Check if input contains only English characters and allowed symbols
      const isEnglishOnly = /^[a-zA-Z0-9_.-]*$/.test(value);

      if (!isEnglishOnly && value.length > 0) {
        // Set custom error for non-English characters
        setValue(name, value, { shouldValidate: true });
        trigger(name); // Trigger validation immediately
      } else {
        // If valid, proceed with normal flow
        debouncedCheckUsername(value);
        setUsername(value);
      }
    };

    //TODO: Clean up the timer when component unmounts
    useEffect(() => {
      return () => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
      };
    }, []);

    const handleResetUsername = () => {
      setValue(name, "");
      setIsUnAvailable(false);
      setSuggestions([]);
    };

    return (
      <>
        <div className="row">
          <div className="col-12">
            <div className="wl-input-container">
              <span className="wl-input-title wl-text-primary">
                Username
                <span className="wl-input-required">*</span>
              </span>
              <div className="wl-position-relative">
                <input
                  type="text"
                  className={`${isUnAvailable ? "error-border" : ""} w-100`}
                  placeholder="Enter Username"
                  {...register(name)}
                  onChange={handleChange}
                />
                <span
                  className="wl-clear-btn"
                  onClick={handleResetUsername}
                ></span>
              </div>
              {isUnAvailable && (
                <>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <figure>
                      <svg
                        style={{ marginRight: 4 }}
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          fill="#bd1822"
                          d="M8 14.2557C4.77257 14.2557 2.11502 11.5981 2.11502 8.3707C2.11502 5.14891 4.77257 2.48572 7.99436 2.48572C11.2218 2.48572 13.885 5.14891 13.885 8.3707C13.885 11.5981 11.2274 14.2557 8 14.2557ZM8 9.29041C8.34983 9.29041 8.55859 9.09292 8.56988 8.72617L8.66016 6.06297C8.67144 5.68494 8.39496 5.4141 7.99436 5.4141C7.59375 5.4141 7.32292 5.67929 7.33984 6.05733L7.42448 8.72617C7.43576 9.09292 7.64453 9.29041 8 9.29041ZM8 11.2765C8.41189 11.2765 8.73915 11 8.73915 10.5994C8.73915 10.2045 8.41189 9.92235 8 9.92235C7.58811 9.92235 7.26649 10.2045 7.26649 10.5994C7.26649 10.9944 7.59375 11.2765 8 11.2765Z"
                        />
                      </svg>
                    </figure>
                    <span style={{ color: "#bd1822" }}>
                      Not available. Please choose the following suggestion.
                    </span>
                  </div>

                  <div className="d-flex flex-wrap flex-lg-row align-items-lg-center gap-2">
                    {suggestions.map((suggestion, index) => (
                      <div
                        className="wl-chips"
                        key={index}
                        onClick={() => {
                          setValue(name, suggestion);
                          debouncedCheckUsername(suggestion);
                        }}
                      >
                        <input
                          id={`wl-chip-${index}`}
                          type="radio"
                          name="wl-chip-groups"
                        />
                        <label htmlFor={`wl-chip-${index}`}>
                          <span>{suggestion}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          {errors && errors[name]?.message && (
            <span className="text-danger">
              {typeof errors[name]?.message === "string"
                ? errors[name]?.message
                : JSON.stringify(errors[name]?.message)}
            </span>
          )}
        </div>
      </>
    );
  }
);

export default UsernameInput;
