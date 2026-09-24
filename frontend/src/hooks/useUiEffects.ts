import { useEffect } from "react";

type SwiperCtor = new (el: string, config: object) => unknown;

export function useNavbarScrollEffect() {
  useEffect(() => {
    const navbar = document.getElementById("mainNavbar");
    const onScroll = () => {
      if (!navbar) return;
      if (window.scrollY > 60) navbar.classList.add("scrolled");
      else navbar.classList.remove("scrolled");
    };
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
}

export function useSwiperInitEffect(dep: unknown) {
  useEffect(() => {
    const w = window as unknown as { Swiper?: SwiperCtor };
    if (!w.Swiper) return;

    if (document.querySelector(".hero-slider") && !document.querySelector(".hero-slider.swiper-initialized")) {
      new w.Swiper(".hero-slider", {
        loop: true,
        autoplay: { delay: 3500, disableOnInteraction: false },
        effect: "fade",
        speed: 900,
        pagination: { el: ".hero-pagination", clickable: true },
        navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" }
      });
    }
    if (document.querySelector(".featured-slider") && !document.querySelector(".featured-slider.swiper-initialized")) {
      new w.Swiper(".featured-slider", {
        slidesPerView: 2,
        spaceBetween: 24,
        loop: true,
        allowTouchMove: false,
        speed: 3500,
        autoplay: { delay: 0, disableOnInteraction: false },
        breakpoints: { 576: { slidesPerView: 3 }, 992: { slidesPerView: 5 }, 1200: { slidesPerView: 6 } }
      });
    }
    if (document.querySelector(".services-slider") && !document.querySelector(".services-slider.swiper-initialized")) {
      new w.Swiper(".services-slider", {
        slidesPerView: 1,
        spaceBetween: 20,
        pagination: { el: ".services-pagination", clickable: true },
        navigation: { nextEl: ".services-next", prevEl: ".services-prev" },
        breakpoints: { 576: { slidesPerView: 2 }, 992: { slidesPerView: 3 }, 1200: { slidesPerView: 4 } }
      });
    }
    if (document.querySelector(".advisory-slider") && !document.querySelector(".advisory-slider.swiper-initialized")) {
      new w.Swiper(".advisory-slider", {
        slidesPerView: 1,
        spaceBetween: 20,
        pagination: { el: ".advisory-pagination", clickable: true },
        navigation: { nextEl: ".advisory-next", prevEl: ".advisory-prev" },
        breakpoints: { 768: { slidesPerView: 2 }, 992: { slidesPerView: 3 }, 1200: { slidesPerView: 4 } }
      });
    }
  }, [dep]);
}
