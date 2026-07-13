(function () {
    'use strict';

    // Config statique (injectée par chaque page via window.FondationAllamConfig).
    // Fallback au cas où la config inline ne serait pas chargée.
    var CFG = window.FondationAllamConfig || {
        donRedirectMode: 'helloasso',
        helloassoMonthly: 'https://www.helloasso.com/associations/fondation-allam/adhesions/dons-mensuel',
        helloassoOnce: 'https://www.helloasso.com/associations/fondation-allam/adhesions/dons-ponctuels',
        googleSheetId: '1TOq8ni8kG1_5IfdfG-MNHLuCBNeUZkmdhC4Kqsn0LTo',
        googleSheetName: 'Feuille 1',
        formEndpoint: 'https://formsubmit.co/ajax/fondation.allam@gmail.com',
        contactPageUrl: 'contact-don-alimentaire.html'
    };

    // Envoi de formulaire via FormSubmit (statique, sans backend) — email formaté en tableau.
    function postForm(form, extras) {
        var formData = new FormData(form);
        if (extras) {
            Object.keys(extras).forEach(function (k) { formData.append(k, extras[k]); });
        }
        formData.set('_captcha', 'false');
        formData.set('_template', 'table');
        return fetch(CFG.formEndpoint, {
            method: 'POST',
            body: formData,
            headers: { 'Accept': 'application/json' }
        });
    }

    // FormSubmit renvoie success sous forme de chaîne "true".
    function isOk(json) {
        return json && (json.success === true || json.success === 'true');
    }

    // Détecte le honeypot (_honey pour FormSubmit, _gotcha en secours).
    function isSpam(form) {
        var h = form.querySelector('[name="_honey"], [name="_gotcha"]');
        return h && h.value;
    }

    // ===== Mobile menu =====
    var mobileMenuBtn = document.getElementById('mobileMenuBtn');
    var nav = document.getElementById('nav');

    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', function () {
            mobileMenuBtn.classList.toggle('active');
            nav.classList.toggle('active');
            document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
        });

        document.querySelectorAll('.nav-link').forEach(function (link) {
            link.addEventListener('click', function () {
                mobileMenuBtn.classList.remove('active');
                nav.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // ===== Header shadow on scroll =====
    var header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', function () {
            var currentScroll = window.pageYOffset;
            header.style.boxShadow = currentScroll > 100
                ? '0 4px 20px rgba(0, 0, 0, 0.15)'
                : '0 2px 10px rgba(0, 0, 0, 0.1)';
        });
    }

    // ===== Active nav link based on scroll =====
    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.nav-link');

    if (sections.length && navLinks.length) {
        window.addEventListener('scroll', function () {
            var current = '';
            sections.forEach(function (section) {
                var sectionTop = section.offsetTop - 150;
                if (window.pageYOffset >= sectionTop) {
                    current = section.getAttribute('id');
                }
            });
            navLinks.forEach(function (link) {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + current) {
                    link.classList.add('active');
                }
            });
        });
    }

    // ===== Counter Animation =====
    function animateCounter(element, target, duration) {
        duration = duration || 2000;
        var start = 0;
        var increment = target / (duration / 16);

        var timer = setInterval(function () {
            start += increment;
            if (start >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(start);
            }
        }, 16);
    }

    var observerOptions = { root: null, rootMargin: '0px', threshold: 0.2 };

    var counterObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                var counters = entry.target.querySelectorAll('[data-target]');
                counters.forEach(function (counter) {
                    var target = parseInt(counter.getAttribute('data-target'), 10);
                    animateCounter(counter, target);
                });
                counterObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    ['.impact', '.about-stats', '.services-stats', '.impact-section', '.distribution-impact', '.transformed-lives'].forEach(function (sel) {
        var el = document.querySelector(sel);
        if (el) counterObserver.observe(el);
    });

    // ===== Scroll Animation Observer =====
    var animationObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.service-card, .news-card, .stat-box, .faq-item, .gallery-item, .impact-stat-card, .cta-entraide-card, .sponsor-item, .why-item').forEach(function (el) {
        el.classList.add('animate-on-scroll');
        animationObserver.observe(el);
    });

    // ===== FAQ Accordion =====
    var faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(function (item) {
        var question = item.querySelector('.faq-question');
        if (!question) return;
        question.addEventListener('click', function () {
            var isActive = item.classList.contains('active');
            faqItems.forEach(function (otherItem) { otherItem.classList.remove('active'); });
            if (!isActive) item.classList.add('active');
        });
    });

    // ===== Smooth Scroll for Anchor Links =====
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var targetId = this.getAttribute('href');
            if (targetId === '#') return;
            var targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                var headerOffset = 80;
                var elementPosition = targetElement.getBoundingClientRect().top;
                var offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            }
        });
    });

    // ===== Newsletter Form (legacy) =====
    var newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var btn = this.querySelector('button[type="submit"]');
            var originalText = btn.textContent;
            btn.textContent = 'Inscrit !';
            btn.style.backgroundColor = '#28a745';
            setTimeout(function () {
                btn.textContent = originalText;
                btn.style.backgroundColor = '';
                newsletterForm.reset();
            }, 3000);
        });
    }

    // ===== Parallax on Hero =====
    var heroImage = document.querySelector('.hero-image');
    if (heroImage) {
        window.addEventListener('scroll', function () {
            var scrolled = window.pageYOffset;
            if (scrolled < window.innerHeight) {
                heroImage.style.transform = 'translateY(' + (scrolled * 0.3) + 'px)';
            }
        });
    }

    // ===== Donation System (9 cards mensuel + 9 cards unique) =====
    var donationTypeButtons = document.querySelectorAll('.donation-type-btn');
    var monthlyGrid = document.querySelector('.donation-amounts.monthly');
    var onceGrid = document.querySelector('.donation-amounts.once');
    var donateBtn = document.getElementById('donateBtn');
    var selectedAmount = 29;
    var isMonthly = true;

    // Don unique = montant libre : le bouton pointe vers le formulaire HelloAsso ponctuel
    var freeDonateBtn = document.getElementById('freeDonateBtn');
    if (freeDonateBtn && CFG.helloassoOnce) {
        freeDonateBtn.href = CFG.helloassoOnce;
    }

    function getActiveCards() {
        var grid = isMonthly ? monthlyGrid : onceGrid;
        return grid ? grid.querySelectorAll('.amount-card') : [];
    }

    function clearCards() {
        getActiveCards().forEach(function (c) {
            c.classList.remove('selected', 'ready');
            var h = c.querySelector('.amount-pay-hint');
            if (h) h.parentNode.removeChild(h);
        });
    }

    function selectAmount(card) {
        clearCards();
        card.classList.add('selected');
        selectedAmount = parseInt(card.dataset.amount, 10);
    }

    function armCard(card) {
        card.classList.add('ready');
        if (!card.querySelector('.amount-pay-hint')) {
            var hint = document.createElement('div');
            hint.className = 'amount-pay-hint';
            hint.textContent = 'Cliquez pour payer →';
            card.appendChild(hint);
        }
    }

    function triggerDonate() {
        // Mode HelloAsso : tous les paiements passent par HelloAsso
        if (CFG.donRedirectMode === 'helloasso') {
            window.location.href = isMonthly ? CFG.helloassoMonthly : CFG.helloassoOnce;
            return;
        }
        // Mode "contact" : redirige vers le formulaire en attendant Stripe
        if (CFG.donRedirectMode === 'contact') {
            var period = isMonthly ? 'mensuel' : 'unique';
            window.location.href = CFG.contactPageUrl + '?don=' + selectedAmount + '&type=' + period + '#contactForm';
            return;
        }
        // Mode Stripe
        if (selectedAmount < 1) {
            alert('Veuillez sélectionner un montant valide.');
            return;
        }
        var links = isMonthly ? CFG.stripeMonthlyLinks : CFG.stripeOneTimeLinks;
        if (links && links[selectedAmount]) {
            window.location.href = links[selectedAmount];
        } else {
            window.location.href = CFG.stripeCustomLink;
        }
    }

    function bindCards(cards) {
        cards.forEach(function (card) {
            card.addEventListener('click', function () {
                // 1er clic : selection + armement ; 2e clic sur la carte armee : paiement
                if (card.classList.contains('ready')) {
                    triggerDonate();
                } else {
                    selectAmount(card);
                    armCard(card);
                }
            });
        });
    }
    if (monthlyGrid) bindCards(monthlyGrid.querySelectorAll('.amount-card'));
    if (onceGrid)    bindCards(onceGrid.querySelectorAll('.amount-card'));

    donationTypeButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            donationTypeButtons.forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');
            isMonthly = btn.dataset.type === 'monthly';

            if (monthlyGrid) monthlyGrid.style.display = isMonthly ? '' : 'none';
            if (onceGrid)    onceGrid.style.display    = isMonthly ? 'none' : '';

            // Sélectionne la card .popular du nouveau jeu (ou la 1ère)
            var activeGrid = isMonthly ? monthlyGrid : onceGrid;
            if (activeGrid) {
                var pop = activeGrid.querySelector('.amount-card.popular') || activeGrid.querySelector('.amount-card');
                if (pop) selectAmount(pop);
            }

            if (donateBtn) {
                donateBtn.textContent = isMonthly ? 'Je fais un don mensuel' : 'Je fais un don unique';
            }
        });
    });

    // Bouton de don conserve (si present) : declenche le meme paiement
    if (donateBtn) {
        donateBtn.addEventListener('click', triggerDonate);
    }

    // Default selected card sur la grille mensuelle visible (card .popular ou la 1ère)
    if (monthlyGrid) {
        var defaultCard = monthlyGrid.querySelector('.amount-card.popular') || monthlyGrid.querySelector('.amount-card');
        if (defaultCard) {
            defaultCard.classList.add('selected');
            selectedAmount = parseInt(defaultCard.dataset.amount, 10);
        }
    }

    // ===== DOM Ready =====
    document.addEventListener('DOMContentLoaded', function () {
        document.body.classList.add('loaded');
        if (faqItems.length > 0) faqItems[0].classList.add('active');

        // Charger les articles si on est sur la page Entraide
        if (document.getElementById('itemsGrid')) {
            loadArticles();
        }
    });

    // ===== Articles (Entraide page) — Google Sheets =====
    var articlesData = [];

    window.loadArticles = function () {
        var grid = document.getElementById('itemsGrid');
        var loading = document.getElementById('loadingState');
        var empty = document.getElementById('emptyState');
        var error = document.getElementById('errorState');
        if (!grid) return;

        grid.innerHTML = '';
        if (loading) loading.style.display = 'block';
        if (empty) empty.style.display = 'none';
        if (error) error.style.display = 'none';

        var url = 'https://docs.google.com/spreadsheets/d/' + CFG.googleSheetId + '/gviz/tq?tqx=out:json&sheet=' + encodeURIComponent(CFG.googleSheetName);

        fetch(url)
            .then(function (r) { return r.text(); })
            .then(function (text) {
                var json = JSON.parse(text.substring(47, text.length - 2));
                var rows = json.table.rows;
                articlesData = [];

                for (var i = 1; i < rows.length; i++) {
                    var row = rows[i].c;
                    if (!row || !row[0]) continue;
                    var article = {
                        titre: row[0] ? row[0].v : '',
                        categorie: row[1] ? row[1].v : '',
                        description: row[2] ? row[2].v : '',
                        ville: row[3] ? row[3].v : '',
                        date: row[4] ? row[4].v : '',
                        photo: row[5] ? row[5].v : '',
                        statut: row[6] ? row[6].v : 'disponible'
                    };
                    var statutLower = (article.statut || '').toLowerCase();
                    if (statutLower !== 'masqué' && statutLower !== 'masque') {
                        articlesData.push(article);
                    }
                }

                if (loading) loading.style.display = 'none';
                if (articlesData.length === 0) {
                    if (empty) empty.style.display = 'block';
                } else {
                    renderArticles(articlesData);
                }
            })
            .catch(function (err) {
                console.error('Erreur chargement:', err);
                if (loading) loading.style.display = 'none';
                if (error) error.style.display = 'block';
            });
    };

    function renderArticles(articles) {
        var grid = document.getElementById('itemsGrid');
        grid.innerHTML = '';

        articles.forEach(function (article, index) {
            var statutLower = (article.statut || '').toLowerCase();
            var isReserved = statutLower === 'réservé' || statutLower === 'reserve';
            var photoUrl = article.photo || 'https://placehold.co/400x200/f5f5f5/666?text=Photo+Article';

            var card = document.createElement('div');
            card.className = 'item-card' + (isReserved ? ' reserved' : '');
            card.dataset.itemId = index + 1;

            card.innerHTML =
                '<img loading="lazy" src="' + photoUrl + '" alt="' + article.titre + '" class="item-image" onerror="this.src=\'https://placehold.co/400x200/f5f5f5/666?text=Photo+Article\'">' +
                '<div class="item-content">' +
                    '<span class="item-category">' + article.categorie + '</span>' +
                    '<h3 class="item-title">' + article.titre + '</h3>' +
                    '<p class="item-description">' + article.description + '</p>' +
                    '<div class="item-meta">' +
                        '<span><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>' + article.ville + '</span>' +
                        '<span><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>' + article.date + '</span>' +
                    '</div>' +
                    '<button class="btn-reserve" ' + (isReserved ? 'disabled' : 'onclick="openReservation(this)"') + '>' +
                    (isReserved ? 'Déjà réservé' : 'Réserver cet article') +
                    '</button>' +
                '</div>';

            grid.appendChild(card);
        });
    }

    // ===== Modal Reservation =====
    window.openReservation = function (btn) {
        var card = btn.closest('.item-card');
        var title = card.querySelector('.item-title').textContent;
        var category = card.querySelector('.item-category').textContent;
        var image = card.querySelector('.item-image').src;

        document.getElementById('modalItemTitle').textContent = title;
        document.getElementById('modalItemCategory').textContent = category;
        document.getElementById('modalItemImage').src = image;
        document.getElementById('hiddenArticle').value = title;

        document.getElementById('reservationModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    window.closeReservation = function () {
        var modal = document.getElementById('reservationModal');
        if (modal) modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    document.addEventListener('click', function (e) {
        var modal = document.getElementById('reservationModal');
        if (modal && e.target === modal) window.closeReservation();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') window.closeReservation();
    });

    // ===== Form submissions (via FormSubmit — statique) =====
    window.submitToWebPrime = function (e) {
        e.preventDefault();
        var form = document.getElementById('contactForm');
        var btn = form.querySelector('button[type="submit"]');
        var originalText = btn.textContent;
        if (isSpam(form)) return false;

        btn.textContent = 'Envoi en cours...';
        btn.disabled = true;

        postForm(form, { type_formulaire: 'CONTACT', _subject: 'Nouveau message de contact — Fondation Allam' })
            .then(function (r) { return r.json(); })
            .then(function (json) {
                if (isOk(json)) {
                    btn.textContent = '✓ Message envoyé !';
                    btn.style.backgroundColor = '#28a745';
                    form.reset();
                    setTimeout(function () {
                        btn.textContent = originalText;
                        btn.style.backgroundColor = '';
                        btn.disabled = false;
                    }, 4000);
                } else {
                    alert("Erreur lors de l'envoi. Veuillez réessayer.");
                    btn.textContent = originalText;
                    btn.disabled = false;
                }
            })
            .catch(function () {
                alert("Erreur de connexion. Veuillez réessayer.");
                btn.textContent = originalText;
                btn.disabled = false;
            });

        return false;
    };

    window.submitReservation = function (e) {
        e.preventDefault();
        var form = document.getElementById('reservationForm');
        var btn = form.querySelector('button[type="submit"]');
        var originalText = btn.textContent;
        if (isSpam(form)) return false;

        btn.textContent = 'Envoi en cours...';
        btn.disabled = true;

        postForm(form, { type_formulaire: 'RESERVATION_ARTICLE', _subject: 'Réservation d\'article — Fondation Allam' })
            .then(function (r) { return r.json(); })
            .then(function (json) {
                if (isOk(json)) {
                    alert('Votre demande a été envoyée ! Nous vous contacterons rapidement pour confirmer.');
                    window.closeReservation();
                    form.reset();
                } else {
                    alert("Erreur lors de l'envoi. Veuillez réessayer.");
                }
            })
            .catch(function () { alert("Erreur de connexion. Veuillez réessayer."); })
            .finally(function () {
                btn.textContent = originalText;
                btn.disabled = false;
            });

        return false;
    };

    window.submitDonation = function (e) {
        e.preventDefault();
        var form = document.getElementById('donateForm');
        var btn = form.querySelector('button[type="submit"]');
        var originalText = btn.textContent;
        if (isSpam(form)) return false;

        btn.textContent = 'Envoi en cours...';
        btn.disabled = true;

        postForm(form, { type_formulaire: 'PROPOSITION_DON', _subject: 'Proposition de don — Fondation Allam' })
            .then(function (r) { return r.json(); })
            .then(function (json) {
                if (isOk(json)) {
                    alert("Merci pour votre générosité ! Nous vous contacterons rapidement pour organiser la récupération de votre don.");
                    form.reset();
                } else {
                    alert("Erreur lors de l'envoi. Veuillez réessayer.");
                }
            })
            .catch(function () { alert("Erreur de connexion. Veuillez réessayer."); })
            .finally(function () {
                btn.textContent = originalText;
                btn.disabled = false;
            });

        return false;
    };

    // ===== Pré-remplir le sujet/message du formulaire contact si don=X dans l'URL =====
    (function prefillDonContext() {
        var contactForm = document.getElementById('contactForm');
        if (!contactForm) return;
        var params = new URLSearchParams(window.location.search);
        var amount = params.get('don');
        var type = params.get('type');
        if (!amount) return;

        var subjectSelect = contactForm.querySelector('select[name="services"]');
        if (subjectSelect) {
            var opt = subjectSelect.querySelector('option[value="DON"]');
            if (opt) subjectSelect.value = 'DON';
        }
        var messageField = contactForm.querySelector('textarea[name="commentaires"]');
        if (messageField && !messageField.value) {
            var label = type === 'unique' ? 'unique' : 'mensuel';
            messageField.value = "Bonjour, je souhaite faire un don " + label + " de " + amount + "€. Pouvez-vous me recontacter pour les modalités ? Merci.";
        }
        // Scroll vers le formulaire
        contactForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    })();

})();
