document.addEventListener('DOMContentLoaded', () => {
    const thumbnails = document.querySelectorAll('.thumbnail');
    const mainImage = document.querySelector('.main-image img');
    const mainImageWrapper = document.querySelector('.main-image');
    const prevBtn = document.querySelector('.main-image .prev');
    const nextBtn = document.querySelector('.main-image .next');
    const zoomPreview = document.querySelector('.zoom-preview');
    const supportsHoverZoom = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    const imageUrls = Array.from(thumbnails).map((thumbnail) => {
        return thumbnail.dataset.full || thumbnail.src;
    });

    const showZoomPreview = (src) => {
        if (!zoomPreview || !supportsHoverZoom) {
            return;
        }

        zoomPreview.style.backgroundImage = `url('${src}')`;
        zoomPreview.classList.add('is-active');
        zoomPreview.setAttribute('aria-hidden', 'false');
    };

    const hideZoomPreview = () => {
        if (!zoomPreview) {
            return;
        }

        zoomPreview.classList.remove('is-active');
        zoomPreview.setAttribute('aria-hidden', 'true');
    };

    const moveZoomPreview = (event, referenceElement) => {
        if (!zoomPreview || !zoomPreview.classList.contains('is-active')) {
            return;
        }

        const previewWidth = zoomPreview.offsetWidth;
        const previewHeight = zoomPreview.offsetHeight;
        let nextLeft = event.clientX + 24;
        let nextTop = event.clientY - previewHeight / 2;

        if (nextLeft + previewWidth > window.innerWidth - 16) {
            nextLeft = event.clientX - previewWidth - 24;
        }

        if (nextTop < 16) {
            nextTop = 16;
        } else if (nextTop + previewHeight > window.innerHeight - 16) {
            nextTop = window.innerHeight - previewHeight - 16;
        }

        zoomPreview.style.left = `${nextLeft}px`;
        zoomPreview.style.top = `${nextTop}px`;

        if (referenceElement) {
            const rect = referenceElement.getBoundingClientRect();
            const relX = ((event.clientX - rect.left) / rect.width) * 100;
            const relY = ((event.clientY - rect.top) / rect.height) * 100;
            zoomPreview.style.backgroundPosition = `${relX}% ${relY}%`;
        }
    };

    const attachZoomHandlers = (element, sourceResolver) => {
        if (!element || !zoomPreview || !supportsHoverZoom) {
            return;
        }

        element.addEventListener('mouseenter', () => {
            const src = sourceResolver();
            if (src) {
                showZoomPreview(src);
            }
        });

        element.addEventListener('mousemove', (event) => {
            moveZoomPreview(event, element);
        });

        element.addEventListener('mouseleave', hideZoomPreview);
    };

    let currentImageIndex = 0;

    function updateMainImage(index) {
        mainImage.src = imageUrls[index];
        thumbnails.forEach((thumb, i) => {
            thumb.classList.toggle('active', i === index);
        });
        currentImageIndex = index;

        if (zoomPreview && zoomPreview.classList.contains('is-active')) {
            showZoomPreview(imageUrls[index]);
        }
    }

    thumbnails.forEach((thumbnail, index) => {
        thumbnail.addEventListener('click', () => {
            updateMainImage(index);
        });

        attachZoomHandlers(thumbnail, () => thumbnail.dataset.full || thumbnail.src);
    });

    attachZoomHandlers(mainImageWrapper, () => mainImage.src);

    prevBtn.addEventListener('click', () => {
        const newIndex = (currentImageIndex - 1 + imageUrls.length) % imageUrls.length;
        updateMainImage(newIndex);
    });

    nextBtn.addEventListener('click', () => {
        const newIndex = (currentImageIndex + 1) % imageUrls.length;
        updateMainImage(newIndex);
    });

    // Initialize the first image
    updateMainImage(0);

    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach((item) => {
        const trigger = item.querySelector('.faq-question');
        const icon = item.querySelector('.faq-icon');

        if (!trigger || !icon) {
            return;
        }

        trigger.addEventListener('click', () => {
            const isOpen = item.classList.contains('is-open');

            faqItems.forEach((faqItem) => {
                const faqTrigger = faqItem.querySelector('.faq-question');
                const faqIcon = faqItem.querySelector('.faq-icon');

                faqItem.classList.remove('is-open');

                if (faqTrigger) {
                    faqTrigger.setAttribute('aria-expanded', 'false');
                }

                if (faqIcon) {
                    faqIcon.innerHTML = '&#709;';
                }
            });

            if (!isOpen) {
                item.classList.add('is-open');
                trigger.setAttribute('aria-expanded', 'true');
                icon.innerHTML = '&#708;';
            }
        });
    });

    const applicationsTrack = document.querySelector('#applicationsTrack');
    const applicationsPrev = document.querySelector('.applications-prev');
    const applicationsNext = document.querySelector('.applications-next');

    if (applicationsTrack && applicationsPrev && applicationsNext) {
        const getScrollAmount = () => {
            const card = applicationsTrack.querySelector('.app-card');

            if (!card) {
                return 320;
            }

            const styles = window.getComputedStyle(applicationsTrack);
            const gap = parseFloat(styles.columnGap || styles.gap || '0');
            return card.getBoundingClientRect().width + gap;
        };

        applicationsPrev.addEventListener('click', () => {
            applicationsTrack.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
        });

        applicationsNext.addEventListener('click', () => {
            applicationsTrack.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
        });
    }

    const floatingHeader = document.querySelector('.floating-header');
    const floatingHeaderInner = document.querySelector('.floating-header__inner');
    const headerContainer = document.querySelector('header .container');

    const calculateFoldThreshold = () => {
        const hero = document.querySelector('.product-details');
        if (!hero) {
            return window.innerHeight;
        }

        return hero.offsetTop + hero.offsetHeight - window.innerHeight * 0.15;
    };

    if (floatingHeader && floatingHeaderInner && headerContainer) {
        floatingHeaderInner.innerHTML = headerContainer.innerHTML;

        let stickyThreshold = calculateFoldThreshold();

        const toggleFloatingHeader = () => {
            const beyondFold = window.scrollY > stickyThreshold;
            floatingHeader.classList.toggle('is-visible', beyondFold);
            floatingHeader.setAttribute('aria-hidden', beyondFold ? 'false' : 'true');

            if (!beyondFold) {
                hideZoomPreview();
            }
        };

        window.addEventListener('scroll', toggleFloatingHeader, { passive: true });
        window.addEventListener('resize', () => {
            stickyThreshold = calculateFoldThreshold();
            toggleFloatingHeader();
        });

        window.addEventListener('load', () => {
            stickyThreshold = calculateFoldThreshold();
            toggleFloatingHeader();
        });

        toggleFloatingHeader();
    }

    const processTabs = document.querySelectorAll('.process-tab');
    const processTitle = document.querySelector('#processTitle');
    const processDescription = document.querySelector('#processDescription');
    const processPoints = document.querySelector('#processPoints');
    const processImage = document.querySelector('#processImage');
    const processPrev = document.querySelector('.process-prev');
    const processNext = document.querySelector('.process-next');

    const processSteps = {
        raw: {
            title: 'High-Grade Raw Material Selection',
            description: 'Vacuum sizing tanks ensure precise outer diameter while internal pressure maintains perfect roundness and wall thickness uniformity.',
            points: ['PE100 grade material', 'Optimal molecular weight distribution'],
            image: 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=1200'
        },
        extrusion: {
            title: 'Precision Extrusion Control',
            description: 'The extrusion stage applies controlled heat and pressure to create a uniform pipe profile with stable structural properties.',
            points: ['Stable melt pressure control', 'Consistent wall formation'],
            image: 'https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?auto=compress&cs=tinysrgb&w=1200'
        },
        cooling: {
            title: 'Uniform Cooling Process',
            description: 'Calibrated cooling systems lock dimensional consistency and reduce internal stress before downstream handling.',
            points: ['Controlled cooling cycles', 'Reduced ovality and distortion'],
            image: 'https://images.pexels.com/photos/127208/pexels-photo-127208.jpeg?auto=compress&cs=tinysrgb&w=1200'
        },
        sizing: {
            title: 'Accurate Sizing and Calibration',
            description: 'Advanced vacuum calibration ensures exact outer diameter and concentric wall thickness across production batches.',
            points: ['Tight dimensional tolerance', 'Improved roundness profile'],
            image: 'https://images.pexels.com/photos/416978/pexels-photo-416978.jpeg?auto=compress&cs=tinysrgb&w=1200'
        },
        quality: {
            title: 'Integrated Quality Control',
            description: 'Each pipe is inspected with in-line monitoring and testing checkpoints to ensure compliance with industry standards.',
            points: ['Real-time defect detection', 'Standards-compliant inspection'],
            image: 'https://images.pexels.com/photos/2760243/pexels-photo-2760243.jpeg?auto=compress&cs=tinysrgb&w=1200'
        },
        marking: {
            title: 'Traceable Product Marking',
            description: 'Automated marking prints batch, grade, and standard data for complete traceability throughout the supply chain.',
            points: ['Clear product identification', 'Batch-level traceability'],
            image: 'https://images.pexels.com/photos/257700/pexels-photo-257700.jpeg?auto=compress&cs=tinysrgb&w=1200'
        },
        cutting: {
            title: 'High-Accuracy Cutting',
            description: 'Synchronized cutting mechanisms deliver precise pipe lengths while protecting edge quality and dimensional accuracy.',
            points: ['Exact length consistency', 'Clean pipe edge finish'],
            image: 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=1200'
        },
        packaging: {
            title: 'Secure Packaging and Dispatch',
            description: 'Final handling ensures products are bundled and protected for safe transport while preserving surface quality.',
            points: ['Damage-resistant packaging', 'Dispatch-ready labeling'],
            image: 'https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?auto=compress&cs=tinysrgb&w=1200'
        }
    };

    const processOrder = ['raw', 'extrusion', 'cooling', 'sizing', 'quality', 'marking', 'cutting', 'packaging'];
    let activeProcessIndex = 0;

    const renderProcess = (stepKey) => {
        const step = processSteps[stepKey];

        if (!step || !processTitle || !processDescription || !processPoints || !processImage) {
            return;
        }

        processTitle.textContent = step.title;
        processDescription.textContent = step.description;
        processImage.src = step.image;

        processPoints.innerHTML = '';
        step.points.forEach((point) => {
            const li = document.createElement('li');
            li.textContent = point;
            processPoints.appendChild(li);
        });

        processTabs.forEach((tab, index) => {
            const isActive = processOrder[index] === stepKey;
            tab.classList.toggle('is-active', isActive);
            tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        activeProcessIndex = processOrder.indexOf(stepKey);
    };

    processTabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            const key = tab.dataset.step;
            if (key) {
                renderProcess(key);
            }
        });
    });

    if (processPrev) {
        processPrev.addEventListener('click', () => {
            const nextIndex = (activeProcessIndex - 1 + processOrder.length) % processOrder.length;
            renderProcess(processOrder[nextIndex]);
        });
    }

    if (processNext) {
        processNext.addEventListener('click', () => {
            const nextIndex = (activeProcessIndex + 1) % processOrder.length;
            renderProcess(processOrder[nextIndex]);
        });
    }

    const configureModal = ({
        modalSelector,
        triggerSelector,
        focusSelector,
        onSubmit,
        shouldValidateEmail = false
    }) => {
        const modal = document.querySelector(modalSelector);
        const trigger = typeof triggerSelector === 'string'
            ? document.querySelectorAll(triggerSelector)
            : triggerSelector;

        if (!modal || !trigger || trigger.length === 0) {
            return;
        }

        const closeTriggers = modal.querySelectorAll('[data-modal-close]');
        const form = modal.querySelector('form');
        const focusTarget = modal.querySelector(focusSelector || 'input, select, textarea, button');
        const submitButton = modal.querySelector('.tech-modal__submit');
        const emailInput = shouldValidateEmail ? modal.querySelector('input[type="email"]') : null;

        const isValidEmail = (value) => /\S+@\S+\.\S+/.test(value.trim());

        const setSubmitState = () => {
            if (!submitButton || !shouldValidateEmail) {
                return;
            }

            const canSubmit = emailInput && isValidEmail(emailInput.value);
            submitButton.disabled = !canSubmit;
        };

        const openModal = () => {
            modal.classList.add('is-open');
            modal.setAttribute('aria-hidden', 'false');
            document.body.classList.add('modal-open');

            if (form) {
                form.reset();
            }

            if (submitButton) {
                submitButton.disabled = shouldValidateEmail;
            }

            if (focusTarget) {
                setTimeout(() => focusTarget.focus(), 50);
            }
        };

        const closeModal = () => {
            modal.classList.remove('is-open');
            modal.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('modal-open');
        };

        Array.from(trigger).forEach((singleTrigger) => {
            singleTrigger.addEventListener('click', (event) => {
                event.preventDefault();
                openModal();
            });
        });

        closeTriggers.forEach((closeTrigger) => {
            closeTrigger.addEventListener('click', closeModal);
        });

        modal.addEventListener('click', (event) => {
            if (event.target === modal || event.target.classList.contains('tech-modal__backdrop')) {
                closeModal();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && modal.classList.contains('is-open')) {
                closeModal();
            }
        });

        if (emailInput) {
            emailInput.addEventListener('input', setSubmitState);
        }

        if (form && submitButton) {
            form.addEventListener('submit', (event) => {
                event.preventDefault();
                submitButton.disabled = true;
                submitButton.textContent = 'Sending…';

                Promise.resolve(onSubmit ? onSubmit(new FormData(form)) : null)
                    .then(() => {
                        submitButton.textContent = submitButton.dataset.defaultText || submitButton.textContent;
                        closeModal();
                    })
                    .catch(() => {
                        submitButton.textContent = submitButton.dataset.errorText || 'Try Again';
                        setTimeout(() => {
                            submitButton.textContent = submitButton.dataset.defaultText || 'Submit';
                            submitButton.disabled = false;
                        }, 1200);
                    });
            });
        }

        if (submitButton && !submitButton.dataset.defaultText) {
            submitButton.dataset.defaultText = submitButton.textContent;
        }

        setSubmitState();
    };

    configureModal({
        modalSelector: '#datasheetModal',
        triggerSelector: '.tech-download-btn',
        focusSelector: 'input[name="datasheet-email"]',
        shouldValidateEmail: true,
        onSubmit: () => new Promise((resolve) => setTimeout(resolve, 1000))
    });

    configureModal({
        modalSelector: '#quoteModal',
        triggerSelector: '[data-quote-trigger]',
        focusSelector: 'input[name="quote-name"]',
        onSubmit: () => new Promise((resolve) => setTimeout(resolve, 1000))
    });
});
