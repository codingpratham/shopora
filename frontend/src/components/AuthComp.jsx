import { useState } from 'react';

const AuthComp = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center">
        {/* Toggle Switch */}
        <div className="relative flex flex-col justify-center items-center gap-7.5 w-[50px] h-[20px] mb-10">
          {/* Labels */}
          <span
            className={`absolute -left-[70px] top-0 w-[100px] font-semibold text-[#323232] cursor-pointer select-none ${
              !isSignUp ? 'underline' : 'no-underline'
            }`}
            onClick={() => setIsSignUp(false)}
          >
            Log in
          </span>
          <span
            className={`absolute left-[70px] top-0 w-[100px] font-semibold text-[#323232] cursor-pointer select-none ${
              isSignUp ? 'underline' : 'no-underline'
            }`}
            onClick={() => setIsSignUp(true)}
          >
            Sign up
          </span>

          {/* Slider Track */}
          <div
            className={`box-border rounded-[5px] border-2 border-[#323232] shadow-[4px_4px_#323232] absolute cursor-pointer inset-0 transition-all duration-300 ${
              isSignUp ? 'bg-[#2d8cf0]' : 'bg-white'
            }`}
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {/* Slider Knob */}
            <div
              className={`box-border absolute h-[20px] w-[20px] border-2 border-[#323232] rounded-[5px] -left-[2px] bottom-[2px] bg-white shadow-[0_3px_0_#323232] transition-transform duration-300 ${
                isSignUp ? 'translate-x-[30px]' : 'translate-x-0'
              }`}
            />
          </div>
        </div>

        {/* Flip Card */}
        <div
          className="w-[300px] h-[350px] relative bg-transparent text-center transition-transform duration-800"
          style={{
            perspective: '1000px',
          }}
        >
          <div
            className="relative w-full h-full transition-transform duration-800"
            style={{
              transformStyle: 'preserve-3d',
              transform: isSignUp ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Front - Login */}
            <div
              className={`p-5 absolute inset-0 flex flex-col justify-center gap-5 rounded-[5px] border-2 border-[#323232] bg-gray-300 ${
                isSignUp ? 'shadow-none' : 'shadow-[4px_4px_#323232]'
              }`}
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="my-5 text-[25px] font-black text-center text-[#323232]">
                Log in
              </div>
              <form className="flex flex-col items-center gap-5">
                <input
                  className="w-[250px] h-[40px] rounded-[5px] border-2 border-[#323232] bg-white shadow-[4px_4px_#323232] text-[15px] font-semibold text-[#323232] px-2.5 py-1.5 outline-none placeholder:text-[#666] placeholder:opacity-80 focus:border-[#2d8cf0]"
                  name="email"
                  placeholder="Email"
                  type="email"
                />
                <input
                  className="w-[250px] h-[40px] rounded-[5px] border-2 border-[#323232] bg-white shadow-[4px_4px_#323232] text-[15px] font-semibold text-[#323232] px-2.5 py-1.5 outline-none placeholder:text-[#666] placeholder:opacity-80 focus:border-[#2d8cf0]"
                  name="password"
                  placeholder="Password"
                  type="password"
                />
                <button
                  type="button"
                  className="my-5 w-[120px] h-[40px] rounded-[5px] border-2 border-[#323232] bg-white shadow-[4px_4px_#323232] text-[17px] font-semibold text-[#323232] cursor-pointer active:shadow-[0px_0px_#323232] active:translate-x-[3px] active:translate-y-[3px]"
                >
                  Let's go!
                </button>
              </form>
            </div>

            {/* Back - Sign Up */}
            <div
              className="p-5 absolute inset-0 flex flex-col justify-center gap-5 rounded-[5px] border-2 border-[#323232] shadow-[4px_4px_#323232] bg-gray-300"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <div className="my-5 text-[25px] font-black text-center text-[#323232]">
                Sign up
              </div>
              <form className="flex flex-col items-center gap-5">
                <input
                  className="w-[250px] h-[40px] rounded-[5px] border-2 border-[#323232] bg-white shadow-[4px_4px_#323232] text-[15px] font-semibold text-[#323232] px-2.5 py-1.5 outline-none placeholder:text-[#666] placeholder:opacity-80 focus:border-[#2d8cf0]"
                  placeholder="Name"
                  type="text"
                />
                <input
                  className="w-[250px] h-[40px] rounded-[5px] border-2 border-[#323232] bg-white shadow-[4px_4px_#323232] text-[15px] font-semibold text-[#323232] px-2.5 py-1.5 outline-none placeholder:text-[#666] placeholder:opacity-80 focus:border-[#2d8cf0]"
                  name="email"
                  placeholder="Email"
                  type="email"
                />
                <input
                  className="w-[250px] h-[40px] rounded-[5px] border-2 border-[#323232] bg-white shadow-[4px_4px_#323232] text-[15px] font-semibold text-[#323232] px-2.5 py-1.5 outline-none placeholder:text-[#666] placeholder:opacity-80 focus:border-[#2d8cf0]"
                  name="password"
                  placeholder="Password"
                  type="password"
                />
                <button
                  type="button"
                  className="my-5 w-[120px] h-[40px] rounded-[5px] border-2 border-[#323232] bg-white shadow-[4px_4px_#323232] text-[17px] font-semibold text-[#323232] cursor-pointer active:shadow-[0px_0px_#323232] active:translate-x-[3px] active:translate-y-[3px]"
                >
                  Confirm!
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthComp;
