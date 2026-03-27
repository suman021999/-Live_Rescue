import React from "react";
import { services } from "../../common/data";

const Services = () => {
  return (
    <section id="services" className="bg-gray-100 py-16 px-6">
      {/* Heading */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-4xl font-bold text-gray-800 mb-3">What We Do?</h2>
        <p className="text-gray-500 text-lg">
          LiveRescue provides instant access to emergency support through video
          calls
        </p>
      </div>

      {/* Cards */}
      <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
        {services.map((service, index) => {
          const Icon = service.icon; 

          return (
            <div key={index} className="bg-white rounded-2xl shadow-md p-8">
              {/* Icon */}
              <div className="w-14 h-14 flex items-center justify-center rounded-full bg-orange-100 mb-6">
                <Icon className="w-6 h-6 text-orange-500" /> {/* ✅ correct */}
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                {service.title}
              </h3>

              {/* Description */}
              <p className="text-gray-500 leading-relaxed">{service.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Services;
