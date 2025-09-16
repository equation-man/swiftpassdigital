/// Registration page.
import React from "react";

const RegistrationPage = () => {
    return (
        <div className="flex flex-col items-center h-screen">
            <div className="mt-25">
                <h3 className="font-semibold text-xl max-w-xs md:max-w-sm">Swift and effortless <span className="text-emerald-700">ticketing</span> for events.</h3>
            </div>
            <div className="flex flex-col items-center py-3">
                <form className="max-w-xs md:max-w-sm">
                    <div>
                        <label className="font-medium text-gray-600">Email</label>
                        <input className="input validator w-full" type="email" required placeholder="mail@gmail.com" />
                    </div>
                    <div>
                        <label className="font-medium text-gray-600">Password</label>
                        <input className="input validator w-full" type="password" required placeholder="********" />
                    </div>
                    <div>
                        <label className="font-medium text-gray-600">Confirm password</label>
                        <input className="input validator w-full" type="password" required placeholder="********" />
                    </div>
                    <button className="btn btn-block mt-3 text-emerald-50 bg-emerald-800">
                        Create Account
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegistrationPage;
