import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import Services from "@/components/Services";
import BeforeAfter from "@/components/BeforeAfter";
import Portfolio from "@/components/Portfolio";
import Process from "@/components/Process";
import About from "@/components/About";
import Testimonials from "@/components/Testimonials";
import BlogTeaser from "@/components/BlogTeaser";
import Contact from "@/components/Contact";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <Services />
      <BeforeAfter />
      <Portfolio />
      <Process />
      <About />
      <Testimonials />
      <BlogTeaser />
      <Contact />
    </>
  );
}
