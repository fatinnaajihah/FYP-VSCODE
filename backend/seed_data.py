"""
Run with:  python manage.py shell < seed_data.py
Or:        python seed_data.py  (from the backend/ directory with Django configured)

Seeds 50 realistic B40 households in Penang + default PriorityCriteria.
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nutriaid.settings')
django.setup()

from beneficiaries.models import Beneficiary
from scoring.models import PriorityCriteria

# ── Realistic Penang B40 household data ──────────────────────────────────────
# Coordinates are real Penang locations (approximate neighbourhood centres)
HOUSEHOLDS = [
    # George Town area
    {"name": "Ahmad bin Kamaruddin",     "ic": "801234-07-1234", "address": "Lorong Kulit, George Town", "district": "george_town",   "lat": 5.4141, "lng": 100.3296, "income": 850,  "category": "extreme_poor", "size": 6, "oku": True,  "elderly": False, "infant": True},
    {"name": "Siti Aminah bt Rashid",    "ic": "750523-07-5678", "address": "Jalan Masjid Kapitan Keling, George Town", "district": "george_town", "lat": 5.4185, "lng": 100.3348, "income": 1200, "category": "poor",         "size": 4, "oku": False, "elderly": True,  "infant": False},
    {"name": "Rajendran a/l Muthu",      "ic": "880912-07-2341", "address": "Jalan Penang, George Town", "district": "george_town",   "lat": 5.4160, "lng": 100.3330, "income": 950,  "category": "extreme_poor", "size": 5, "oku": False, "elderly": False, "infant": False},
    {"name": "Lim Ah Kow",               "ic": "720304-07-8765", "address": "Jalan Chowrasta, George Town", "district": "george_town","lat": 5.4175, "lng": 100.3310, "income": 1500, "category": "poor",         "size": 3, "oku": True,  "elderly": True,  "infant": False},
    {"name": "Norzaharah bt Hashim",     "ic": "900615-07-4321", "address": "Lorong Argyll, George Town", "district": "george_town",  "lat": 5.4100, "lng": 100.3280, "income": 3200, "category": "vulnerable",   "size": 5, "oku": False, "elderly": False, "infant": True},

    # Air Itam
    {"name": "Zulkifli bin Hamid",       "ic": "851020-07-3456", "address": "Jalan Air Itam, Air Itam",   "district": "air_itam",     "lat": 5.3985, "lng": 100.2947, "income": 900,  "category": "extreme_poor", "size": 7, "oku": True,  "elderly": False, "infant": False},
    {"name": "Kavitha a/p Subramaniam",  "ic": "920210-07-6543", "address": "Jln Paya Terubong, Air Itam","district": "air_itam",     "lat": 5.3955, "lng": 100.2990, "income": 1800, "category": "poor",         "size": 4, "oku": False, "elderly": True,  "infant": False},
    {"name": "Noraini bt Abdullah",      "ic": "781130-07-9870", "address": "Taman Lip Sin, Air Itam",    "district": "air_itam",     "lat": 5.4010, "lng": 100.2960, "income": 2500, "category": "vulnerable",   "size": 6, "oku": False, "elderly": False, "infant": True},
    {"name": "Wong Chee Keong",          "ic": "650801-07-1122", "address": "Taman Paya Terubong, Air Itam","district": "air_itam",   "lat": 5.3940, "lng": 100.3000, "income": 700,  "category": "extreme_poor", "size": 2, "oku": True,  "elderly": True,  "infant": False},
    {"name": "Hafizuddin bin Salleh",    "ic": "931107-07-3344", "address": "Jalan Stesen, Air Itam",     "district": "air_itam",     "lat": 5.3970, "lng": 100.2930, "income": 1100, "category": "poor",         "size": 5, "oku": False, "elderly": False, "infant": True},

    # Jelutong
    {"name": "Santhi a/p Rajan",         "ic": "840320-07-5566", "address": "Jalan Jelutong, Jelutong",   "district": "jelutong",     "lat": 5.3978, "lng": 100.3167, "income": 1350, "category": "poor",         "size": 5, "oku": False, "elderly": False, "infant": False},
    {"name": "Mohd Faizal bin Yusoff",   "ic": "970415-07-7788", "address": "Desa Jelutong Flat, Jelutong","district": "jelutong",    "lat": 5.3960, "lng": 100.3140, "income": 850,  "category": "extreme_poor", "size": 8, "oku": True,  "elderly": False, "infant": True},
    {"name": "Tan Bee Leng",             "ic": "701225-07-9900", "address": "Jalan Perak, Jelutong",      "district": "jelutong",     "lat": 5.3990, "lng": 100.3195, "income": 4200, "category": "vulnerable",   "size": 4, "oku": False, "elderly": True,  "infant": False},
    {"name": "Rosmawati bt Ismail",      "ic": "880726-07-1133", "address": "PPR Jelutong, Jelutong",     "district": "jelutong",     "lat": 5.3950, "lng": 100.3155, "income": 1600, "category": "poor",         "size": 6, "oku": False, "elderly": False, "infant": True},
    {"name": "Ravi a/l Krishnan",        "ic": "760512-07-2255", "address": "Jalan Baru, Jelutong",       "district": "jelutong",     "lat": 5.4005, "lng": 100.3175, "income": 980,  "category": "extreme_poor", "size": 3, "oku": True,  "elderly": True,  "infant": False},

    # Bayan Lepas
    {"name": "Farah bt Zainudin",        "ic": "950830-07-3366", "address": "Taman Sri Nibong, Bayan Lepas","district": "bayan_lepas", "lat": 5.3020, "lng": 100.2693, "income": 2200, "category": "vulnerable",   "size": 5, "oku": False, "elderly": False, "infant": True},
    {"name": "Subramanian a/l Pillai",   "ic": "830614-07-4477", "address": "Taman Bayan Indah, Bayan Lepas","district": "bayan_lepas","lat": 5.2985, "lng": 100.2720, "income": 1700, "category": "poor",         "size": 4, "oku": True,  "elderly": False, "infant": False},
    {"name": "Azizah bt Omar",           "ic": "720908-07-5588", "address": "Perkampungan Nelayan, Bayan Lepas","district": "bayan_lepas","lat": 5.2940, "lng": 100.2670, "income": 650,  "category": "extreme_poor", "size": 9, "oku": False, "elderly": True,  "infant": True},
    {"name": "Chia Kean Huat",           "ic": "891114-07-6699", "address": "Taman Pantai Mutiara, Bayan Lepas","district": "bayan_lepas","lat": 5.3055, "lng": 100.2750, "income": 3800, "category": "vulnerable",   "size": 3, "oku": False, "elderly": False, "infant": False},
    {"name": "Norizan bt Sulaiman",      "ic": "910222-07-7711", "address": "PPR Bayan Lepas Flat",        "district": "bayan_lepas", "lat": 5.3010, "lng": 100.2705, "income": 1150, "category": "poor",         "size": 7, "oku": True,  "elderly": False, "infant": True},

    # Butterworth
    {"name": "Mohd Rizal bin Daud",      "ic": "820403-02-1234", "address": "Jalan Bagan Luar, Butterworth","district": "butterworth", "lat": 5.3990, "lng": 100.3630, "income": 1000, "category": "poor",         "size": 5, "oku": False, "elderly": True,  "infant": False},
    {"name": "Punitha a/p Veloo",        "ic": "770809-02-5678", "address": "Taman Aman, Butterworth",     "district": "butterworth",  "lat": 5.4020, "lng": 100.3670, "income": 780,  "category": "extreme_poor", "size": 6, "oku": True,  "elderly": False, "infant": False},
    {"name": "Hasnah bt Ghazali",        "ic": "960117-02-9012", "address": "PPR Rifle Range, Butterworth","district": "butterworth",  "lat": 5.3960, "lng": 100.3600, "income": 2800, "category": "vulnerable",   "size": 4, "oku": False, "elderly": False, "infant": True},
    {"name": "Chong Wei Ming",           "ic": "810625-02-3456", "address": "Jalan Kapal, Butterworth",    "district": "butterworth",  "lat": 5.4005, "lng": 100.3650, "income": 1400, "category": "poor",         "size": 3, "oku": False, "elderly": True,  "infant": False},
    {"name": "Suriani bt Zulkepli",      "ic": "900318-02-7890", "address": "Flat PPR Ampangan, Butterworth","district": "butterworth","lat": 5.3975, "lng": 100.3615, "income": 600,  "category": "extreme_poor", "size": 10,"oku": True,  "elderly": True,  "infant": True},

    # Seberang Perai
    {"name": "Amirullah bin Zainal",     "ic": "871123-02-2233", "address": "Taman Perai Jaya, Seberang Perai","district": "seberang_perai","lat": 5.3889, "lng": 100.3987, "income": 2000, "category": "vulnerable",   "size": 5, "oku": False, "elderly": False, "infant": False},
    {"name": "Kamala a/p Nair",          "ic": "750631-02-4455", "address": "Kampung Baru, Seberang Perai", "district": "seberang_perai","lat": 5.3860, "lng": 100.3950, "income": 900,  "category": "extreme_poor", "size": 4, "oku": True,  "elderly": False, "infant": True},
    {"name": "Rohaya bt Mat",            "ic": "830901-02-6677", "address": "Taman Sri Muda, Seberang Perai","district": "seberang_perai","lat": 5.3920, "lng": 100.4010, "income": 1300, "category": "poor",         "size": 7, "oku": False, "elderly": True,  "infant": False},
    {"name": "Lim Kok Wai",              "ic": "691215-02-8899", "address": "Jalan Besar, Seberang Perai", "district": "seberang_perai","lat": 5.3900, "lng": 100.3970, "income": 4600, "category": "vulnerable",   "size": 2, "oku": False, "elderly": True,  "infant": False},
    {"name": "Norzainal bt Ahmad",       "ic": "961002-02-1011", "address": "PPR Sri Impian, Seberang Perai","district": "seberang_perai","lat": 5.3875, "lng": 100.3940, "income": 1750, "category": "poor",         "size": 6, "oku": True,  "elderly": False, "infant": True},

    # Balik Pulau
    {"name": "Idris bin Hassan",         "ic": "780710-07-3344", "address": "Jalan Balik Pulau, Balik Pulau","district": "balik_pulau","lat": 5.3495, "lng": 100.2285, "income": 750,  "category": "extreme_poor", "size": 8, "oku": False, "elderly": True,  "infant": True},
    {"name": "Meenakshi a/p Sundaram",   "ic": "910405-07-5566", "address": "Kampung Nelayan Balik Pulau",  "district": "balik_pulau", "lat": 5.3460, "lng": 100.2260, "income": 1050, "category": "poor",         "size": 5, "oku": True,  "elderly": False, "infant": False},
    {"name": "Normah bt Kassim",         "ic": "830820-07-7788", "address": "Taman Pertanian, Balik Pulau", "district": "balik_pulau", "lat": 5.3530, "lng": 100.2310, "income": 3500, "category": "vulnerable",   "size": 4, "oku": False, "elderly": False, "infant": True},
    {"name": "Koh Boon Seng",            "ic": "700112-07-9900", "address": "Jalan Gertak Sanggul, Balik Pulau","district": "balik_pulau","lat": 5.3440, "lng": 100.2230, "income": 2200, "category": "vulnerable",   "size": 3, "oku": False, "elderly": True,  "infant": False},
    {"name": "Zaiton bt Ibrahim",        "ic": "951230-07-1122", "address": "Kampung Sungai Pinang, Balik Pulau","district": "balik_pulau","lat": 5.3510, "lng": 100.2295, "income": 850,  "category": "extreme_poor", "size": 6, "oku": True,  "elderly": False, "infant": True},

    # Tanjung Bungah
    {"name": "Shahril bin Mohamad",      "ic": "890714-07-2244", "address": "Taman Bunga Raya, Tanjung Bungah","district": "tanjung_bungah","lat": 5.4700, "lng": 100.2885, "income": 1650, "category": "poor",         "size": 5, "oku": False, "elderly": False, "infant": True},
    {"name": "Usha a/p Gopal",           "ic": "731128-07-4466", "address": "Batu Ferringhi Road, Tanjung Bungah","district": "tanjung_bungah","lat": 5.4720, "lng": 100.2870, "income": 4700, "category": "vulnerable",   "size": 3, "oku": False, "elderly": True,  "infant": False},
    {"name": "Norhayati bt Zakaria",     "ic": "860930-07-6688", "address": "Taman Tanjung Bungah Permai",  "district": "tanjung_bungah","lat": 5.4685, "lng": 100.2900, "income": 2100, "category": "vulnerable",   "size": 4, "oku": True,  "elderly": False, "infant": False},
    {"name": "Teoh Kim Hock",            "ic": "780405-07-8811", "address": "Jalan Batu Ferringhi, Tanjung Bungah","district": "tanjung_bungah","lat": 5.4740, "lng": 100.2855, "income": 1300, "category": "poor",         "size": 6, "oku": False, "elderly": False, "infant": True},
    {"name": "Azwan bin Ramli",          "ic": "940822-07-1133", "address": "Kampung Nelayan Tanjung Bungah","district": "tanjung_bungah","lat": 5.4660, "lng": 100.2920, "income": 750,  "category": "extreme_poor", "size": 7, "oku": True,  "elderly": True,  "infant": True},

    # More George Town (PPR flats)
    {"name": "Razali bin Bakar",         "ic": "820617-07-3355", "address": "PPR Rifle Range, George Town", "district": "george_town",  "lat": 5.4050, "lng": 100.3220, "income": 900,  "category": "extreme_poor", "size": 5, "oku": False, "elderly": False, "infant": False},
    {"name": "Malathi a/p Pillai",       "ic": "901214-07-5577", "address": "Sungai Dua Flats, George Town","district": "george_town",  "lat": 5.4085, "lng": 100.3250, "income": 1900, "category": "poor",         "size": 4, "oku": True,  "elderly": False, "infant": True},
    {"name": "Junainah bt Mustafa",      "ic": "771119-07-7799", "address": "Lorong Selamat, George Town",  "district": "george_town",  "lat": 5.4120, "lng": 100.3270, "income": 1200, "category": "poor",         "size": 6, "oku": False, "elderly": True,  "infant": False},

    # More Air Itam
    {"name": "Subramaniam a/l Ponniah",  "ic": "840706-07-9911", "address": "Jalan Paya Terubong Dalam",   "district": "air_itam",     "lat": 5.3930, "lng": 100.3020, "income": 3000, "category": "vulnerable",   "size": 5, "oku": False, "elderly": False, "infant": True},
    {"name": "Rohani bt Baharudin",      "ic": "691005-07-1133", "address": "Taman Gombak Indah, Air Itam","district": "air_itam",     "lat": 5.3915, "lng": 100.2975, "income": 800,  "category": "extreme_poor", "size": 3, "oku": True,  "elderly": True,  "infant": False},

    # More Butterworth
    {"name": "Krishnan a/l Suppiah",     "ic": "880224-02-2244", "address": "Jalan Bagan Dalam, Butterworth","district": "butterworth", "lat": 5.3948, "lng": 100.3593, "income": 1450, "category": "poor",         "size": 4, "oku": False, "elderly": False, "infant": False},
    {"name": "Hanisah bt Mokhtar",       "ic": "940519-02-4466", "address": "Flat PPR Butterworth",         "district": "butterworth",  "lat": 5.3962, "lng": 100.3611, "income": 2600, "category": "vulnerable",   "size": 6, "oku": False, "elderly": True,  "infant": True},

    # More Seberang Perai
    {"name": "Thiagarajan a/l Raman",    "ic": "811003-02-6688", "address": "Taman Maju, Seberang Perai",   "district": "seberang_perai","lat": 5.3843, "lng": 100.3925, "income": 1650, "category": "poor",         "size": 5, "oku": True,  "elderly": False, "infant": False},
    {"name": "Salmah bt Yusof",          "ic": "930731-02-8810", "address": "Kampung Melayu, Seberang Perai","district": "seberang_perai","lat": 5.3858, "lng": 100.3958, "income": 700,  "category": "extreme_poor", "size": 8, "oku": False, "elderly": True,  "infant": True},

    # More Jelutong
    {"name": "Mohd Hanafi bin Rahim",    "ic": "791010-07-0012", "address": "Jalan Utama, Jelutong",        "district": "jelutong",     "lat": 5.3972, "lng": 100.3182, "income": 2400, "category": "vulnerable",   "size": 5, "oku": True,  "elderly": False, "infant": False},
]


def seed():
    # Clear existing data
    print("Clearing existing beneficiaries...")
    Beneficiary.objects.all().delete()

    # Seed PriorityCriteria
    PriorityCriteria.objects.all().delete()
    criteria = PriorityCriteria.objects.create(
        income_weight=40.0,
        household_size_weight=25.0,
        oku_weight=20.0,
        elderly_weight=10.0,
        infant_weight=5.0,
    )
    print("Default PriorityCriteria created.")

    # Seed Beneficiaries
    created = 0
    for h in HOUSEHOLDS:
        b = Beneficiary.objects.create(
            name=h["name"],
            ic_number=h["ic"],
            address=h["address"],
            district=h["district"],
            latitude=h["lat"],
            longitude=h["lng"],
            monthly_income=h["income"],
            income_category=h["category"],
            household_size=h["size"],
            has_oku=h["oku"],
            has_elderly=h["elderly"],
            has_infant=h["infant"],
        )
        # Calculate and save priority score
        from scoring.views import calculate_priority_score
        b.priority_score = calculate_priority_score(b, criteria)
        b.save(update_fields=['priority_score'])
        created += 1

    print(f"Seeded {created} B40 households in Penang.")
    print(f"Extreme poor: {Beneficiary.objects.filter(income_category='extreme_poor').count()}")
    print(f"Poor:         {Beneficiary.objects.filter(income_category='poor').count()}")
    print(f"Vulnerable:   {Beneficiary.objects.filter(income_category='vulnerable').count()}")


if __name__ == '__main__':
    seed()
