// Events component.
import React from "react";

const Events = () => {
    return (
        <div>
            <div className="carousel carousel-center rounded-box w-full space-x-4 p-4">
              <div className="carousel-item">
                <div className="card bg-base-100 w-70 shadow-sm">
                  <figure>
                    <img
                      src="/football.jpg"
                      alt="football" />
                  </figure>
                  <div className="card-body">
                    <h2 className="card-title">
                      Mashemeji derby
                      <div className="badge bg-emerald-500 text-white">2% off</div>
                    </h2>
                    <p>Gor Mahia vs AFC Lopards at moi stadium.</p>
                    <div className="card-actions justify-end">
                        <button className="px-4 py-1 bg-green-600 font-semibold rounded-sm hover:cursor-pointer text-white">Get ticket</button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="carousel-item">
                <div className="card bg-base-100 w-70 shadow-sm">
                  <figure>
                    <img
                      src="/athletics.jpg"
                      alt="Athletics" />
                  </figure>
                  <div className="card-body">
                    <h2 className="card-title">
                      Pipsa athletics championship
                    </h2>
                    <p>Developmental athletics championship.</p>
                    <div className="card-actions justify-end">
                        <button className="px-4 py-1 bg-green-600 font-semibold rounded-sm hover:cursor-pointer text-white">Get ticket</button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="carousel-item">
                <div className="card bg-base-100 w-70 shadow-sm">
                  <figure>
                    <img
                      src="/waterpolo.jpg"
                      alt="Waterpolo" />
                  </figure>
                  <div className="card-body">
                    <h2 className="card-title">
                      Waterpolo
                      <div className="badge bg-emerald-500 text-white">5% off</div>
                    </h2>
                    <p>International waterpolo championship.</p>
                    <div className="card-actions justify-end">
                        <button className="px-4 py-1 bg-green-600 font-semibold rounded-sm hover:cursor-pointer text-white">Get ticket</button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="carousel-item">
                <div className="card bg-base-100 w-70 shadow-sm">
                  <figure>
                    <img
                      src="/basketball.jpg"
                      alt="basketball" />
                  </figure>
                  <div className="card-body">
                    <div>
                        <h2 className="card-title">
                          Central Region Basketball Championship
                        </h2>
                        <div className="badge bg-emerald-500 text-white">5% off</div>
                    </div>
                    <p>Basketball championship for central kenya region.</p>
                    <div className="card-actions justify-end">
                        <button className="px-4 py-1 bg-green-600 font-semibold rounded-sm hover:cursor-pointer text-white">Get ticket</button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="carousel-item">
                <div className="card bg-base-100 w-70 shadow-sm">
                  <figure>
                    <img
                      src="/technology.jpg"
                      alt="Technology" />
                  </figure>
                  <div className="card-body">
                    <h2 className="card-title">
                      Tech Founders hangout
                    </h2>
                    <p>Social event for tech entreprenuers.</p>
                    <div className="card-actions justify-end">
                        <button className="px-4 py-1 bg-green-600 font-semibold rounded-sm hover:cursor-pointer text-white">Get ticket</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </div>
    );
};

export default Events;
