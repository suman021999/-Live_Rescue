import React from "react";
import { ArrowRight } from "lucide-react";
import { steps } from "../data";

const Workflow = () => {
  return (
    <section id="workflow" className="bg-gray-100 py-20 px-6">
      {/* Heading */}
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-gray-800">
          Emergency Support in 3 Simple Steps
        </h2>
      </div>

      {/* Steps */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-6 max-w-5xl mx-auto">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            {/* Step */}
            <div className="flex flex-col items-center text-center">
              {/* Circle */}
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-orange-500 text-white text-xl font-bold">
                {step.number}
              </div>

              {/* Title */}
              <h3 className="mt-4 text-lg font-semibold text-gray-800">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-gray-500 text-sm mt-2 max-w-xs">{step.desc}</p>
            </div>

            {/* Arrow */}
            {index !== steps.length - 1 && (
              <div className="hidden md:flex items-center justify-center -mt-16">
                <ArrowRight className="w-6 h-6 text-orange-500" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
};

export default Workflow;
