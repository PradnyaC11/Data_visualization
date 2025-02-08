import React, { Suspense } from 'react';
import './HomePage.css';
import { Element, scroller } from 'react-scroll';
import { useSpring, animated } from '@react-spring/web';
import HeaderSection from './components/Header';
import { AirportProvider } from './AirportContext';

const YearlyCountChart = React.lazy(() => import('./components/YearlyCountChart'));
const Heatmap = React.lazy(() => import('./components/Heatmap'));
const FlightRoute = React.lazy(() => import('./components/FlightRoute'));
const FlightDelayChart = React.lazy(() => import('./components/flight_delay'));
const AccidentTimeline = React.lazy(() => import('./components/accidentTimeline'));
const SafetyVsAccidents = React.lazy(() => import('./components/SafetyVsAccidents'));
const AviationSafetyTimeline = React.lazy(() => import('./components/SafetyMeasures'));

function Home() {
    const scrollToSection = (id) => {
        scroller.scrollTo(id, {
            duration: 800,
            delay: 0,
            smooth: 'easeOutQuint',
        });
    };

    const AnimatedElement = ({ name, LazyComponent, children }) => {
        const [isLoaded, setIsLoaded] = React.useState(false);
        const [isVisible, setIsVisible] = React.useState(false);
        const elementRef = React.useRef(null);

        const styles = useSpring({
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
            config: { duration: 600 },
        });

        React.useEffect(() => {
            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting && !isLoaded) {
                        setIsLoaded(true);
                    }
                    setIsVisible(entry.isIntersecting)
                },
                { threshold: 0.1 }
            );
            if (elementRef.current) {
                observer.observe(elementRef.current);
            } else {
                console.error(`Element with name "${name}" not found.`);
            }

            return () => {
                if (elementRef.current) observer.unobserve(elementRef.current);
            };
        }, [isLoaded]);

        return (
            <Element name={name}>
                <div ref={elementRef}>
                    <animated.div ref={elementRef} style={{ ...styles, willChange: 'opacity, transform' }} >
                        {isLoaded ? (
                            <Suspense fallback={<div>Loading...</div>}>
                                {LazyComponent ? <LazyComponent /> : children}
                            </Suspense>
                        ) : (
                            <div>Loading section...</div>
                        )}
                    </animated.div>
                </div>
            </Element>
        );
    };

    return (
        <AirportProvider>
            <div className="myContainer">
                {/* Landing Section */}
                <Element name="headSection">
                    <div className="landing-section">
                        <HeaderSection />
                        <button onClick={() => scrollToSection('introText')}>Let's Take Off</button>
                    </div>
                </Element>

                <Element name="introText">
                    <div className="sectionText" style={{ padding: "50px 200px 0 200px" }}>
                        <p className='para'>Air travel has revolutionized the way we connect with the world, transforming distant cities into easily accessible destinations. Over the decades, the U.S. aviation industry has witnessed remarkable growth, weaving a vast network of passenger travel that reflects the nation’s increasing reliance on air connectivity. However, this expansion has not been without challenges—ranging from operational hurdles and delays to ensuring the safety of millions of passengers. </p>
                        <p className='para'>To uncover the evolution of this industry, we embark on a data-driven journey, exploring patterns of passenger growth, efficiency improvements, and safety innovations that have shaped modern aviation.</p>
                        <p className='para'>To grasp the scale of this transformation, we begin by examining the total number of passengers who traveled through U.S. airports from 2000 to 2022.</p>
                    </div>
                </Element>

                {/* Section 1: Passenger Traffic */}
                <Element name="yearlyCount">
                    <div className="section">
                        <YearlyCountChart />
                    </div>
                </Element>
                <Element name="yearlyCountText">
                    <div className="sectionText">
                        <p>While the annual trends tell a story of resilience and recovery, the map of 2023 passenger traffic takes us a step further—unveiling the diversity of regional contributions to the aviation network. This geographic perspective showcases how densely connected hubs sustain the aviation network, while every state contributes uniquely to the nation's intricate travel ecosystem.
                        </p>
                    </div>
                </Element>

                {/* Section 2: Passenger Traffic */}
                <Element name="heatmap">
                    <div className="section">
                        <Heatmap />
                    </div>
                </Element>
                <Element name="heatmapText">
                    <div className="sectionText" style={{fontFamily:"Open Sans", padding: "0px 100px", fontSize:"20px"}}>
                        <p>The distribution of passenger traffic across the U.S. is deeply influenced by the interconnected roles of airports. The map below vividly illustrates the collaborative dynamics of the U.S. aviation network, where airports of all sizes play a critical role. Smaller airports, represented in yellow, serve regional and niche markets, while larger hubs, shown in blue, act as the backbone of long-distance travel and international connectivity. Red-marked medium-sized airports bridge these two extremes, ensuring the smooth flow of passengers between local and global destinations. Together, these airports form an intricate web of connectivity, enabling seamless travel and reinforcing the interdependence of regional and national air traffic systems.

                        </p>
                    </div>
                </Element>

                {/* Section 3: Flight Routes */}
                <Element name="flightRoute">
                    <div className="section side-by-side-container">
                        <FlightRoute id="flightRouteChart" />
                        <FlightDelayChart id="flightDelayChart" />
                    </div>
                </Element>
                

                {/* Section 4: Flight Delays */}
                <Element name="flightDelaysText">
                    <div className="sectionText">
                        <p>While operational disruptions may cause inconvenience to travelers, safety remains the cornerstone of aviation trust. Examining accident trends over time provides a deeper understanding of how targeted safety measures have addressed risks, reshaping the industry’s approach to protecting passengers and preventing future incidents.

                        </p>
                    </div>
                </Element>

                {/* Section 5: Accident Locations */}
                <Element name="accident">
                    <div className="section">
                        <AccidentTimeline />
                    </div>
                </Element>
                <Element name="accidentText">
                    <div className="sectionText">
                        <p>Patterns in aviation accidents have served as catalysts for groundbreaking innovations, driving the industry to continuously evolve. Each challenge has spurred advancements that have reshaped the aviation landscape, from early safety features to modern technologies that prioritize passenger protection and operational efficiency, paving the way for safer skies.</p>
                    </div>
                </Element>

                {/* Section 6: Safety Measures */}
                <Element name="safetyMeasures">
                    <div className="section">
                        <AviationSafetyTimeline />
                    </div>
                </Element>
                {/* Section 7: Safety vs. Accidents */}
                <Element name="safetyVsAccidentsElement">
                    <div className="section">
                        <SafetyVsAccidents />
                    </div>
                </Element>
                <Element name="conclusion">
                    <div className="sectionText" style={{ padding: "100px 200px" }}>
                        <p className='para'>Reflecting on the journey of U.S. aviation, it’s clear that technology, data, and a steadfast commitment to safety have been pivotal in transforming air travel. From steadily growing passenger numbers to overcoming challenges like the COVID-19 pandemic, the industry has consistently adapted to changing times. Innovations in aircraft technology, air traffic management, and sustainability initiatives have redefined how we travel, ensuring safer, faster, and more efficient connections across the globe. </p>
                        <p className='para'>Looking ahead, the future of aviation holds immense promise. Emerging technologies, such as electric and hydrogen-powered aircraft, alongside a continued focus on passenger experience, signal a new era for air travel. The U.S. aviation industry’s resilience and dedication to innovation will undoubtedly pave the way for a safer, more connected, and sustainable future, reinforcing its role as a vital link in the global network.</p>
                    </div>
                </Element>
            </div>
        </AirportProvider>
    );
}

export default Home;
