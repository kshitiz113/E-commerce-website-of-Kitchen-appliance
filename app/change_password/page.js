"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [requirements, setRequirements] = useState({
    length: false,
    uppercase: false,
    number: false,
    specialChar: false,
    match: false
  });
  const router = useRouter();

  // Password strength calculator and requirement checker
  useEffect(() => {
    if (!newPassword) {
      setPasswordStrength(0);
      setRequirements({
        length: false,
        uppercase: false,
        number: false,
        specialChar: false,
        match: false
      });
      return;
    }

    let strength = 0;
    const newRequirements = {
      length: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      number: /[0-9]/.test(newPassword),
      specialChar: /[^A-Za-z0-9]/.test(newPassword),
      match: newPassword === confirmPassword && confirmPassword.length > 0
    };

    // Calculate strength based on requirements
    if (newRequirements.length) strength += 1;
    if (newRequirements.uppercase) strength += 1;
    if (newRequirements.number) strength += 1;
    if (newRequirements.specialChar) strength += 1;
    if (newRequirements.match) strength += 1;

    setPasswordStrength(strength);
    setRequirements(newRequirements);
  }, [newPassword, confirmPassword]);

  const allRequirementsMet = () => {
    return (
      requirements.length &&
      requirements.uppercase &&
      requirements.number &&
      requirements.specialChar &&
      requirements.match
    );
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    // Comprehensive client-side validation
    if (!currentPassword) {
      setMessage("❌ Please enter your current password");
      setIsLoading(false);
      return;
    }

    if (!allRequirementsMet()) {
      setMessage("❌ Please meet all password requirements");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ Password changed successfully!");
        // Clear form
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        // Redirect after success
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setMessage(`❌ ${data.error || "Failed to change password"}`);
      }
    } catch (error) {
      setMessage("❌ Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return "bg-red-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
      <div className="w-full max-w-md bg-gray-800 p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-4 text-gray-200">Change Password</h2>
        
        {message && (
          <div className={`p-3 mb-4 rounded-md text-center text-sm ${
            message.includes("✅") ? "bg-green-900/50" : "bg-red-900/50"
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="relative">
            <label className="block text-gray-300 mb-1">Current Password</label>
            <div className="relative">
              <input
                type={showPassword.current ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-2 pr-10 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("current")}
                className="absolute right-2 top-2 text-gray-400 hover:text-white"
              >
                {showPassword.current ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-gray-300 mb-1">New Password</label>
            <div className="relative">
              <input
                type={showPassword.new ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2 pr-10 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("new")}
                className="absolute right-2 top-2 text-gray-400 hover:text-white"
              >
                {showPassword.new ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                )}
              </button>
            </div>
            
            {newPassword && (
              <div className="mt-2">
                <div className="flex items-center mb-1">
                  <span className="text-xs text-gray-400">Password strength:</span>
                  <div className="w-full ml-2 bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getPasswordStrengthColor()}`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li className={`flex items-center ${requirements.length ? 'text-green-400' : 'text-red-400'}`}>
                    {requirements.length ? '✓' : '✗'} At least 8 characters
                  </li>
                  <li className={`flex items-center ${requirements.uppercase ? 'text-green-400' : 'text-red-400'}`}>
                    {requirements.uppercase ? '✓' : '✗'} At least 1 uppercase letter
                  </li>
                  <li className={`flex items-center ${requirements.number ? 'text-green-400' : 'text-red-400'}`}>
                    {requirements.number ? '✓' : '✗'} At least 1 number
                  </li>
                  <li className={`flex items-center ${requirements.specialChar ? 'text-green-400' : 'text-red-400'}`}>
                    {requirements.specialChar ? '✓' : '✗'} At least 1 special character
                  </li>
                </ul>
              </div>
            )}
          </div>

          <div className="relative">
            <label className="block text-gray-300 mb-1">Confirm New Password</label>
            <div className="relative">
              <input
                type={showPassword.confirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full p-2 pr-10 bg-gray-700 border ${
                  confirmPassword && !requirements.match ? 'border-red-500' : 'border-gray-600'
                } rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("confirm")}
                className="absolute right-2 top-2 text-gray-400 hover:text-white"
              >
                {showPassword.confirm ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                )}
              </button>
            </div>
            
            {confirmPassword && !requirements.match && (
              <p className="text-red-400 text-xs mt-1">Passwords don't match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !allRequirementsMet()}
            className={`w-full p-2 rounded-md transition duration-200 flex items-center justify-center ${
              isLoading 
                ? "bg-blue-700 cursor-not-allowed" 
                : allRequirementsMet() 
                  ? "bg-blue-500 hover:bg-blue-600" 
                  : "bg-gray-600 cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Changing...
              </>
            ) : (
              "Change Password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}