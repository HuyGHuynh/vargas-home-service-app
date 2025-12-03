--
-- PostgreSQL database dump
--

\restrict EhzlbHMBpiW0LldBueF9sLTgTrRchbTrCbgfwAi6LU4JeaYcc0gxyoNAbmCG7F8

-- Dumped from database version 17.7 (178558d)
-- Dumped by pg_dump version 18.0

-- Started on 2025-12-03 13:06:37

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 219 (class 1259 OID 57421)
-- Name: addressbook; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.addressbook (
    address_id integer NOT NULL,
    customer_id integer NOT NULL,
    address character varying(100) NOT NULL,
    city character varying(50) NOT NULL,
    state character(2) NOT NULL,
    zip_code character(5) NOT NULL
);


--
-- TOC entry 235 (class 1259 OID 106497)
-- Name: addressbook_addressid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.addressbook ALTER COLUMN address_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.addressbook_addressid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 217 (class 1259 OID 57411)
-- Name: customer; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer (
    customerid integer NOT NULL,
    firstname character varying(50) NOT NULL,
    lastname character varying(50) NOT NULL,
    phone character varying(15),
    email character varying(100)
);


--
-- TOC entry 234 (class 1259 OID 106496)
-- Name: customer_customerid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.customer ALTER COLUMN customerid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.customer_customerid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 241 (class 1259 OID 139313)
-- Name: empavailability; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.empavailability (
    availability_id integer NOT NULL,
    employee_id integer,
    availdate date NOT NULL,
    starttime time without time zone NOT NULL,
    endtime time without time zone NOT NULL
);


--
-- TOC entry 240 (class 1259 OID 139312)
-- Name: empavailability_availability_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.empavailability_availability_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3550 (class 0 OID 0)
-- Dependencies: 240
-- Name: empavailability_availability_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.empavailability_availability_id_seq OWNED BY public.empavailability.availability_id;


--
-- TOC entry 218 (class 1259 OID 57416)
-- Name: employee; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employee (
    employeeid integer NOT NULL,
    firstname character varying(50) NOT NULL,
    lastname character varying(50) NOT NULL,
    phone character(12),
    email character varying(100),
    isadmin boolean NOT NULL,
    username character varying(50),
    password character varying(50),
    hiredate date,
    status character varying(20) DEFAULT 'Active'::character varying,
    CONSTRAINT chk_employee_status CHECK (((status)::text = ANY ((ARRAY['Active'::character varying, 'Inactive'::character varying, 'On Leave'::character varying])::text[])))
);


--
-- TOC entry 236 (class 1259 OID 106498)
-- Name: employee_employeeid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.employee ALTER COLUMN employeeid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.employee_employeeid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 227 (class 1259 OID 65666)
-- Name: employee_specialties; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employee_specialties (
    employeeid integer NOT NULL,
    specialty_id integer NOT NULL
);


--
-- TOC entry 231 (class 1259 OID 65699)
-- Name: finalpricedetails; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.finalpricedetails (
    finalprice_id integer NOT NULL,
    pricetotal numeric(10,2) NOT NULL,
    request_id integer,
    CONSTRAINT "priceTotal_check" CHECK ((pricetotal >= (0)::numeric))
);


--
-- TOC entry 230 (class 1259 OID 65698)
-- Name: estimates_estimate_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.estimates_estimate_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3551 (class 0 OID 0)
-- Dependencies: 230
-- Name: estimates_estimate_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.estimates_estimate_id_seq OWNED BY public.finalpricedetails.finalprice_id;


--
-- TOC entry 244 (class 1259 OID 155673)
-- Name: finance_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.finance_categories (
    category_id integer NOT NULL,
    category_name character varying(50) NOT NULL,
    category_direction_type character varying(10) NOT NULL,
    description text,
    CONSTRAINT finance_categories_category_direction_type_check CHECK (((category_direction_type)::text = ANY ((ARRAY['IN'::character varying, 'OUT'::character varying, 'BOTH'::character varying])::text[])))
);


--
-- TOC entry 243 (class 1259 OID 155672)
-- Name: finance_categories_category_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.finance_categories_category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3552 (class 0 OID 0)
-- Dependencies: 243
-- Name: finance_categories_category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.finance_categories_category_id_seq OWNED BY public.finance_categories.category_id;


--
-- TOC entry 246 (class 1259 OID 155686)
-- Name: finance_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.finance_transactions (
    txn_id integer NOT NULL,
    request_id integer,
    employeeid integer,
    category_id integer,
    txn_date date DEFAULT CURRENT_DATE,
    direction character varying(3),
    amount numeric(10,2) NOT NULL,
    description character varying(255),
    status character varying(15) DEFAULT 'Cleared'::character varying,
    CONSTRAINT finance_transactions_amount_check CHECK ((amount >= (0)::numeric)),
    CONSTRAINT finance_transactions_direction_check CHECK (((direction)::text = ANY ((ARRAY['IN'::character varying, 'OUT'::character varying])::text[]))),
    CONSTRAINT finance_transactions_status_check CHECK (((status)::text = ANY ((ARRAY['Cleared'::character varying, 'Unpaid'::character varying, 'Pending'::character varying, 'Cancelled'::character varying])::text[])))
);


--
-- TOC entry 245 (class 1259 OID 155685)
-- Name: finance_transactions_txn_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.finance_transactions_txn_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3553 (class 0 OID 0)
-- Dependencies: 245
-- Name: finance_transactions_txn_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.finance_transactions_txn_id_seq OWNED BY public.finance_transactions.txn_id;


--
-- TOC entry 248 (class 1259 OID 204801)
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.password_reset_tokens (
    token_id integer NOT NULL,
    employeeid integer NOT NULL,
    token character varying(255) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 247 (class 1259 OID 204800)
-- Name: password_reset_tokens_token_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.password_reset_tokens_token_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3554 (class 0 OID 0)
-- Dependencies: 247
-- Name: password_reset_tokens_token_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.password_reset_tokens_token_id_seq OWNED BY public.password_reset_tokens.token_id;


--
-- TOC entry 222 (class 1259 OID 65557)
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    review_id integer NOT NULL,
    customer_id integer NOT NULL,
    comments character varying(500),
    request_id integer,
    rating_quality smallint NOT NULL,
    rating_professionalism smallint NOT NULL,
    rating_timeliness smallint NOT NULL,
    rating_communication smallint NOT NULL,
    rating_overall smallint NOT NULL,
    avg_rating numeric(3,2) GENERATED ALWAYS AS (((((((rating_quality + rating_professionalism) + rating_timeliness) + rating_communication) + rating_overall))::numeric / 5.0)) STORED,
    CONSTRAINT reviews_rating_communication_check CHECK (((rating_communication >= 1) AND (rating_communication <= 5))),
    CONSTRAINT reviews_rating_overall_check CHECK (((rating_overall >= 1) AND (rating_overall <= 5))),
    CONSTRAINT reviews_rating_professionalism_check CHECK (((rating_professionalism >= 1) AND (rating_professionalism <= 5))),
    CONSTRAINT reviews_rating_quality_check CHECK (((rating_quality >= 1) AND (rating_quality <= 5))),
    CONSTRAINT reviews_rating_timeliness_check CHECK (((rating_timeliness >= 1) AND (rating_timeliness <= 5)))
);


--
-- TOC entry 221 (class 1259 OID 65556)
-- Name: reviews_review_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reviews_review_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3555 (class 0 OID 0)
-- Dependencies: 221
-- Name: reviews_review_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reviews_review_id_seq OWNED BY public.reviews.review_id;


--
-- TOC entry 242 (class 1259 OID 155648)
-- Name: service_type_specialties; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_type_specialties (
    service_type_id integer NOT NULL,
    specialty_id integer NOT NULL
);


--
-- TOC entry 239 (class 1259 OID 131073)
-- Name: service_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_types (
    service_type_id integer NOT NULL,
    service_type_name character varying(50) NOT NULL
);


--
-- TOC entry 238 (class 1259 OID 131072)
-- Name: service_types_service_type_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.service_types_service_type_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3556 (class 0 OID 0)
-- Dependencies: 238
-- Name: service_types_service_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.service_types_service_type_id_seq OWNED BY public.service_types.service_type_id;


--
-- TOC entry 220 (class 1259 OID 57431)
-- Name: servicerequests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.servicerequests (
    requestid integer NOT NULL,
    customerid integer NOT NULL,
    addressid integer NOT NULL,
    preferred_datetime timestamp with time zone NOT NULL,
    service_id integer,
    description character varying(500) DEFAULT 'No description provided'::character varying NOT NULL,
    status character varying(20) DEFAULT 'Pending'::character varying,
    imageurl character varying(255),
    CONSTRAINT chk_status_valid CHECK (((status)::text = ANY ((ARRAY['Pending'::character varying, 'In Progress'::character varying, 'Completed'::character varying, 'Cancelled'::character varying])::text[])))
);


--
-- TOC entry 237 (class 1259 OID 106517)
-- Name: servicerequests_requestid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.servicerequests ALTER COLUMN requestid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.servicerequests_requestid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 224 (class 1259 OID 65577)
-- Name: services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.services (
    service_id integer NOT NULL,
    job_desc character varying(255),
    service_price numeric(5,2) NOT NULL,
    service_type_id integer NOT NULL,
    job_name character varying(100) NOT NULL,
    duration_hours numeric(5,2),
    CONSTRAINT chk_duration_positive CHECK (((duration_hours IS NULL) OR (duration_hours > (0)::numeric))),
    CONSTRAINT chk_service_price_nonneg CHECK (((service_price)::double precision >= ((0)::numeric)::double precision))
);


--
-- TOC entry 223 (class 1259 OID 65576)
-- Name: services_service_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.services_service_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3557 (class 0 OID 0)
-- Dependencies: 223
-- Name: services_service_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.services_service_id_seq OWNED BY public.services.service_id;


--
-- TOC entry 226 (class 1259 OID 65659)
-- Name: specialties; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.specialties (
    specialty_id integer NOT NULL,
    specialty_name character varying(50) NOT NULL
);


--
-- TOC entry 225 (class 1259 OID 65658)
-- Name: specialties_specialty_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.specialties_specialty_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3558 (class 0 OID 0)
-- Dependencies: 225
-- Name: specialties_specialty_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.specialties_specialty_id_seq OWNED BY public.specialties.specialty_id;


--
-- TOC entry 233 (class 1259 OID 65712)
-- Name: warranties; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.warranties (
    warranty_id integer NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    description character varying(255),
    request_id integer,
    price numeric(10,2),
    status character varying(20) DEFAULT 'Pending'::character varying,
    CONSTRAINT chk_dates CHECK ((end_date > start_date)),
    CONSTRAINT warranties_status_check CHECK (((status)::text = ANY ((ARRAY['Pending'::character varying, 'Active'::character varying, 'Inactive'::character varying])::text[])))
);


--
-- TOC entry 232 (class 1259 OID 65711)
-- Name: warranties_warranty_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.warranties_warranty_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3559 (class 0 OID 0)
-- Dependencies: 232
-- Name: warranties_warranty_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.warranties_warranty_id_seq OWNED BY public.warranties.warranty_id;


--
-- TOC entry 229 (class 1259 OID 65682)
-- Name: work_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.work_assignments (
    assignment_id integer NOT NULL,
    requestid integer NOT NULL,
    employeeid integer NOT NULL
);


--
-- TOC entry 228 (class 1259 OID 65681)
-- Name: work_assignments_assignment_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.work_assignments_assignment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3560 (class 0 OID 0)
-- Dependencies: 228
-- Name: work_assignments_assignment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.work_assignments_assignment_id_seq OWNED BY public.work_assignments.assignment_id;


--
-- TOC entry 3277 (class 2604 OID 139316)
-- Name: empavailability availability_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.empavailability ALTER COLUMN availability_id SET DEFAULT nextval('public.empavailability_availability_id_seq'::regclass);


--
-- TOC entry 3273 (class 2604 OID 65702)
-- Name: finalpricedetails finalprice_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finalpricedetails ALTER COLUMN finalprice_id SET DEFAULT nextval('public.estimates_estimate_id_seq'::regclass);


--
-- TOC entry 3278 (class 2604 OID 155676)
-- Name: finance_categories category_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_categories ALTER COLUMN category_id SET DEFAULT nextval('public.finance_categories_category_id_seq'::regclass);


--
-- TOC entry 3279 (class 2604 OID 155689)
-- Name: finance_transactions txn_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_transactions ALTER COLUMN txn_id SET DEFAULT nextval('public.finance_transactions_txn_id_seq'::regclass);


--
-- TOC entry 3282 (class 2604 OID 204804)
-- Name: password_reset_tokens token_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens ALTER COLUMN token_id SET DEFAULT nextval('public.password_reset_tokens_token_id_seq'::regclass);


--
-- TOC entry 3268 (class 2604 OID 65560)
-- Name: reviews review_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews ALTER COLUMN review_id SET DEFAULT nextval('public.reviews_review_id_seq'::regclass);


--
-- TOC entry 3276 (class 2604 OID 131076)
-- Name: service_types service_type_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_types ALTER COLUMN service_type_id SET DEFAULT nextval('public.service_types_service_type_id_seq'::regclass);


--
-- TOC entry 3270 (class 2604 OID 65580)
-- Name: services service_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services ALTER COLUMN service_id SET DEFAULT nextval('public.services_service_id_seq'::regclass);


--
-- TOC entry 3271 (class 2604 OID 65662)
-- Name: specialties specialty_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.specialties ALTER COLUMN specialty_id SET DEFAULT nextval('public.specialties_specialty_id_seq'::regclass);


--
-- TOC entry 3274 (class 2604 OID 65715)
-- Name: warranties warranty_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warranties ALTER COLUMN warranty_id SET DEFAULT nextval('public.warranties_warranty_id_seq'::regclass);


--
-- TOC entry 3272 (class 2604 OID 65685)
-- Name: work_assignments assignment_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_assignments ALTER COLUMN assignment_id SET DEFAULT nextval('public.work_assignments_assignment_id_seq'::regclass);


--
-- TOC entry 3515 (class 0 OID 57421)
-- Dependencies: 219
-- Data for Name: addressbook; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.addressbook (address_id, customer_id, address, city, state, zip_code) FROM stdin;
1	1	123 Maple Street	Atlantic City	NJ	08401
2	2	789 Pine Lane	Galloway	NJ	08205
3	3	56 Harbor Drive	Brigantine	NJ	08203
4	4	901 Sunset Blvd	Ventnor	NJ	08406
5	5	33 Garden Court	Egg Harbor	NJ	08234
6	6	12 Lakeview Terrace	Mays Landing	NJ	08330
7	7	45 Oak Street	Atlantic City	NJ	08401
8	8	88 Cedar Avenue	Galloway	NJ	08205
9	9	120 Bayview Road	Brigantine	NJ	08203
10	10	502 Marina Court	Ventnor	NJ	08406
11	11	77 Meadow Lane	Egg Harbor	NJ	08234
12	12	19 Brookside Drive	Mays Landing	NJ	08330
13	13	210 Pinecone Way	Galloway	NJ	08205
14	14	390 Ridgeview Terrace	Atlantic City	NJ	08401
15	7	45 Oak Street	Atlantic City	NJ	08401
16	8	88 Cedar Avenue	Galloway	NJ	08205
17	9	120 Bayview Road	Brigantine	NJ	08203
18	10	502 Marina Court	Ventnor	NJ	08406
19	11	77 Meadow Lane	Egg Harbor	NJ	08234
20	12	19 Brookside Drive	Mays Landing	NJ	08330
21	13	210 Pinecone Way	Galloway	NJ	08205
22	14	390 Ridgeview Terrace	Atlantic City	NJ	08401
23	15	31 Ave	Sugar Land	NJ	31411
24	16	1823 NEU	Sugar Land	NJ	12312
25	17	31 Ave	Sugar Land	NJ	12456
26	18	209 ABH	ajiwe	NJ	22981
27	19	382 aufnew	uweefew	NJ	38181
28	17	181 Havannah St	New Brunswick	NJ	38111
30	21	1385 North	Atlantic City	NJ	08401
31	22	1245 awndhjw	Atlantic	NJ	08401
\.


--
-- TOC entry 3513 (class 0 OID 57411)
-- Dependencies: 217
-- Data for Name: customer; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customer (customerid, firstname, lastname, phone, email) FROM stdin;
1	John	Smith	6095550001	john.smith@example.com
2	Maria	Garcia	6095550002	maria.garcia@example.com
3	David	Lee	6095550003	david.lee@example.com
4	Sarah	Johnson	6095550004	sarah.johnson@example.com
5	Ahmed	Khan	6095550005	ahmed.khan@example.com
6	Emily	Davis	6095550006	emily.davis@example.com
7	Liam	Moore	6095550010	liam.moore@example.com
8	Chloe	Allen	6095550011	chloe.allen@example.com
9	Noah	Scott	6095550012	noah.scott@example.com
10	Grace	Hill	6095550013	grace.hill@example.com
11	Lucas	Perez	6095550014	lucas.perez@example.com
12	Ava	Turner	6095550015	ava.turner@example.com
13	Henry	Cooper	6095550016	henry.cooper@example.com
14	Zoe	Rivera	6095550017	zoe.rivera@example.com
15	Jensen	Hong	8218272911	jhong@example.com
16	Jensen	Kim	8218272121	phonee2e@gmail.com
18	Fix	Bug	(191) 191-8181	example@example.com
19	awe	jaiee	(218) 581-3581	uher@gmail.com
17	Jensen	Baker	1918381911	J.lee@gmail.com
21	Juan	Villaman	(136) 751-3757	yuhhuynh@gmail.com
22	Hui	Huinh	1258181719	yuhhuynh+1@gmail.com
\.


--
-- TOC entry 3537 (class 0 OID 139313)
-- Dependencies: 241
-- Data for Name: empavailability; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.empavailability (availability_id, employee_id, availdate, starttime, endtime) FROM stdin;
1	1	2025-10-04	08:00:00	12:00:00
2	1	2025-10-05	13:00:00	17:00:00
3	2	2025-10-10	09:00:00	17:00:00
4	2	2025-10-15	08:30:00	16:30:00
5	3	2025-11-01	10:00:00	18:00:00
6	3	2025-11-02	09:00:00	15:00:00
7	4	2025-11-19	08:00:00	14:00:00
8	5	2025-12-01	12:00:00	18:00:00
9	6	2025-12-14	09:00:00	17:00:00
10	7	2025-12-16	08:00:00	12:00:00
11	2	2025-11-25	09:00:00	17:00:00
13	15	2025-12-04	09:00:00	17:00:00
\.


--
-- TOC entry 3514 (class 0 OID 57416)
-- Dependencies: 218
-- Data for Name: employee; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.employee (employeeid, firstname, lastname, phone, email, isadmin, username, password, hiredate, status) FROM stdin;
1	Michael	Vargas	6095551001  	michael.vargas@example.com	t	mvargas	Passw0rd!	2023-01-10	Active
3	Jason	Rodriguez	6095551003  	jason.rod@example.com	f	jrod	Passw0rd!	2024-02-20	Active
5	Robert	Nguyen	6095551005  	robert.nguyen@example.com	f	rnguyen	Passw0rd!	2024-02-10	Active
6	Olivia	Martinez	6095551006  	olivia.martinez@example.com	f	omart	Passw0rd!	2024-04-01	Active
7	Daniel	Chen	6095551007  	daniel.chen@example.com	f	dchen	Passw0rd!	2024-05-15	Active
8	Sophia	Brown	6095551008  	sophia.brown@example.com	t	sbrown	Passw0rd!	2023-11-20	Active
9	Kevin	Wilson	6095551009  	kevin.wilson@example.com	f	kwilson	Passw0rd!	2024-03-12	On Leave
4	Hannah	Baker	6095551004  	hannah.baker@example.com	f	hbaker	Passw0rd!	2024-01-05	Active
2	Laura	Kim	6095551002  	employee@vargas	f	lkim	employee	2023-03-05	Active
10	Isabella	Lopez	6095551010  	j.man@gmail.com	f	ilopez	employee	2024-06-01	Inactive
15	Huy	Huynh	1918347181  	yuhhuynh@gmail.com	f	\N	employee1	2025-12-02	Active
\.


--
-- TOC entry 3523 (class 0 OID 65666)
-- Dependencies: 227
-- Data for Name: employee_specialties; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.employee_specialties (employeeid, specialty_id) FROM stdin;
1	1
1	3
3	2
3	3
5	1
5	6
6	5
6	6
7	2
8	1
9	5
10	6
4	3
4	2
4	6
4	5
4	4
4	1
2	3
2	2
2	6
2	5
2	4
2	1
15	1
\.


--
-- TOC entry 3527 (class 0 OID 65699)
-- Dependencies: 231
-- Data for Name: finalpricedetails; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.finalpricedetails (finalprice_id, pricetotal, request_id) FROM stdin;
1	120.00	1
2	350.00	2
3	90.00	3
4	150.00	4
6	180.00	6
7	145.00	7
8	220.00	8
9	95.00	9
10	180.00	10
11	210.00	11
13	130.00	13
14	190.00	14
15	90.00	15
16	240.00	16
17	160.00	17
18	280.00	18
19	150.00	19
20	210.00	20
21	175.00	21
23	220.00	23
24	350.00	24
25	80.00	25
26	160.00	26
35	200.00	29
36	230.00	30
37	150.00	31
38	150.00	32
40	450.00	34
\.


--
-- TOC entry 3540 (class 0 OID 155673)
-- Dependencies: 244
-- Data for Name: finance_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.finance_categories (category_id, category_name, category_direction_type, description) FROM stdin;
1	Customer Payment	IN	Payments received from customers
2	Materials	OUT	Materials and supplies for jobs
3	Labor	OUT	Employee labor cost for jobs
4	Other Expense	OUT	Miscellaneous operating expenses
\.


--
-- TOC entry 3542 (class 0 OID 155686)
-- Dependencies: 246
-- Data for Name: finance_transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.finance_transactions (txn_id, request_id, employeeid, category_id, txn_date, direction, amount, description, status) FROM stdin;
1	1	1	1	2025-10-06	IN	120.00	Customer payment - kitchen faucet repair	Cleared
2	2	2	2	2025-10-16	OUT	75.50	Paint and supplies - living room painting	Cleared
3	3	1	3	2025-11-03	OUT	60.00	Employee labor - shelf installation	Cleared
4	4	2	1	2025-11-21	IN	150.00	Customer payment - outlet repair	Cleared
7	1	2	2	2025-10-04	OUT	18.75	Plumbing tape, washers, sealant for faucet repair	Cleared
8	1	1	3	2025-10-05	OUT	45.00	Labor - one hour faucet diagnostics/repair	Cleared
9	2	3	2	2025-10-14	OUT	42.30	Primer and masking tape - living room painting	Cleared
10	2	2	1	2025-10-18	IN	120.00	Partial customer payment - living room painting	Cleared
11	2	2	1	2025-10-25	IN	230.00	Final customer payment - living room painting	Cleared
12	3	1	4	2025-11-02	OUT	12.50	Parking and tolls - shelf installation job	Cleared
13	3	1	3	2025-11-02	OUT	55.00	Labor - shelf installation (setup and cleanup)	Cleared
14	3	1	1	2025-11-04	IN	90.00	Customer payment - shelf installation	Cleared
15	4	3	2	2025-11-20	OUT	35.90	Outlet parts, wiring, and faceplates	Cleared
16	4	3	1	2025-11-22	IN	40.00	Additional fee - emergency evening service	Cleared
5	\N	3	2	2025-12-02	OUT	25.00	Fuel/transport - deck power washing	Pending
17	\N	2	3	2025-12-02	OUT	80.00	Labor - deck power washing (2 hours)	Pending
20	7	1	1	2025-10-03	IN	145.00	Customer payment for job: Replace bathroom sink faucet leaking slowly	Cleared
21	8	2	1	2025-10-05	IN	220.00	Customer payment for job: Repaint small bedroom accent wall	Cleared
22	9	3	1	2025-10-08	IN	95.00	Customer payment for job: Repair loose interior door handle	Cleared
23	10	4	1	2025-10-19	IN	180.00	Customer payment for job: Clean gutters on single-story home	Cleared
24	13	1	1	2025-11-02	IN	130.00	Customer payment for job: Fix running toilet in main bathroom	Cleared
25	14	2	1	2025-11-07	IN	190.00	Customer payment for job: Mount 55-inch TV in living room	Cleared
26	15	3	1	2025-11-11	IN	90.00	Customer payment for job: Seasonal HVAC filter replacement	Cleared
27	16	4	1	2025-11-17	IN	240.00	Customer payment for job: Emergency visit for water dripping from ceiling	Cleared
28	19	7	1	2025-12-04	IN	150.00	Customer payment for job: Bathroom deep cleaning before guests arrive	Cleared
29	20	8	1	2025-12-06	IN	210.00	Customer payment for job: Install kitchen backsplash lighting	Cleared
30	21	9	1	2025-12-10	IN	175.00	Customer payment for job: Repair squeaky wooden steps	Cleared
31	\N	\N	2	2025-11-25	OUT	15.00	One broken nail.	Cleared
32	\N	2	1	2025-12-03	IN	200.00	Additional payment	Cleared
33	\N	1	1	2025-12-03	IN	100.00	pending	Pending
19	6	1	1	2025-12-17	IN	180.00	Customer payment - drywall repair (paid in full)	Cleared
6	6	2	1	2025-12-16	IN	180.00	Customer payment - drywall repair	Cleared
34	\N	\N	2	2025-12-02	OUT	15.00	Pay for 2 screw.	Cleared
\.


--
-- TOC entry 3544 (class 0 OID 204801)
-- Dependencies: 248
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.password_reset_tokens (token_id, employeeid, token, expires_at, created_at) FROM stdin;
1	2	89979678-1d3d-49fb-865f-80f80bc277f6	2025-11-24 19:16:58.687899	2025-11-24 18:17:00.334788
2	2	b93c9fcc-f95f-4408-baea-56e104f7d78c	2025-11-24 19:24:58.758577	2025-11-24 18:25:00.33296
3	2	45c72eac-bb7d-46b4-8588-e8622abc55b8	2025-11-24 19:29:36.069593	2025-11-24 18:29:37.791035
4	2	1a9db977-4d07-42c9-9b8f-6817f5130bab	2025-11-24 19:38:05.394686	2025-11-24 18:38:06.781131
5	2	9aa41464-50e2-4ce1-b4db-0c2a42c3bf47	2025-11-24 19:45:32.544113	2025-11-24 18:45:34.185989
6	1	c14c78b6-365b-4945-9773-2516ad6f03cc	2025-11-25 17:35:46.456974	2025-11-25 16:35:46.991331
9	10	eda71ae4-be32-4b37-8124-fad48bbd114f	2025-11-27 22:17:08.241171	2025-11-27 21:17:07.361394
\.


--
-- TOC entry 3518 (class 0 OID 65557)
-- Dependencies: 222
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reviews (review_id, customer_id, comments, request_id, rating_quality, rating_professionalism, rating_timeliness, rating_communication, rating_overall) FROM stdin;
1	1	Great job fixing the leak, very clean work.	1	5	5	5	5	5
2	1	Nice painting, a little slower than expected but looks good.	2	4	4	3	4	4
3	2	Shelves are sturdy and level, very satisfied.	3	5	5	4	5	5
4	3	Quick troubleshooting and repair, explained everything clearly.	4	5	5	5	4	5
6	7	Very satisfied with the service.	7	4	3	5	4	5
7	9	\N	9	5	5	5	5	4
8	7	\N	19	3	5	4	3	4
9	9	Job was done well and on time.	21	4	4	5	4	4
10	4	Slight delay, but the work was solid.	16	4	5	3	3	4
11	10	\N	10	5	4	3	3	5
12	3	\N	15	4	3	5	5	3
13	1	Very satisfied with the service.	13	3	3	4	3	3
14	8	Job was done well and on time.	8	5	4	4	5	5
15	8	\N	20	5	4	5	4	3
16	2	Job was done well and on time.	14	5	4	3	5	3
17	21	I like Vargas Service	34	3	4	5	2	5
\.


--
-- TOC entry 3538 (class 0 OID 155648)
-- Dependencies: 242
-- Data for Name: service_type_specialties; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.service_type_specialties (service_type_id, specialty_id) FROM stdin;
1	1
1	2
1	3
2	1
2	2
2	3
2	4
3	1
3	2
3	5
4	1
4	2
5	6
\.


--
-- TOC entry 3535 (class 0 OID 131073)
-- Dependencies: 239
-- Data for Name: service_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.service_types (service_type_id, service_type_name) FROM stdin;
1	Minor Repair
2	New Installation
3	Maintenance Visit
4	Emergency Call
5	Deep Cleaning
\.


--
-- TOC entry 3516 (class 0 OID 57431)
-- Dependencies: 220
-- Data for Name: servicerequests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.servicerequests (requestid, customerid, addressid, preferred_datetime, service_id, description, status, imageurl) FROM stdin;
1	1	1	2025-10-05 13:00:00+00	1	Fix leaking kitchen faucet	Completed	\N
2	1	2	2025-10-15 18:30:00+00	4	Paint living room walls	Completed	\N
3	2	3	2025-11-02 16:00:00+00	5	Assemble and install wall shelves	Completed	\N
4	3	4	2025-11-20 21:00:00+00	2	Repair broken electrical outlet	Completed	\N
6	5	6	2025-12-15 18:00:00+00	3	Patch and repaint drywall hole	Pending	\N
7	7	7	2025-10-02 13:00:00+00	1	Replace bathroom sink faucet leaking slowly	Completed	\N
8	8	8	2025-10-04 15:00:00+00	4	Repaint small bedroom accent wall	Completed	\N
9	9	9	2025-10-07 19:00:00+00	1	Repair loose interior door handle	Completed	\N
10	10	10	2025-10-18 14:30:00+00	6	Clean gutters on single-story home	Completed	\N
11	11	11	2025-10-23 18:00:00+00	5	Install ceiling fan in dining room	Pending	\N
13	1	1	2025-11-01 14:30:00+00	1	Fix running toilet in main bathroom	Completed	\N
14	2	2	2025-11-06 18:15:00+00	5	Mount 55-inch TV in living room	Completed	\N
15	3	3	2025-11-10 15:00:00+00	6	Seasonal HVAC filter replacement	Completed	\N
16	4	4	2025-11-16 21:45:00+00	2	Emergency visit for water dripping from ceiling	Completed	\N
17	5	5	2025-11-21 14:00:00+00	6	Exterior home walkthrough inspection	Pending	\N
18	6	6	2025-11-28 16:30:00+00	6	Move-out deep cleaning for 2-bedroom apartment	Pending	\N
19	7	7	2025-12-03 14:00:00+00	6	Bathroom deep cleaning before guests arrive	Completed	\N
20	8	8	2025-12-05 19:30:00+00	5	Install kitchen backsplash lighting	Completed	\N
21	9	9	2025-12-09 20:00:00+00	3	Repair squeaky wooden steps	Completed	\N
23	11	11	2025-12-15 18:00:00+00	2	Emergency outlet sparking in kitchen	Pending	\N
24	12	12	2025-12-20 14:30:00+00	6	Whole-house deep cleaning after remodel	Pending	\N
25	13	13	2025-12-22 16:00:00+00	3	Repair damaged window screen on back door	Pending	\N
29	17	25	2025-11-26 09:00:00+00	20	fix asap	Pending	\N
26	14	14	2025-12-28 21:15:00+00	5	Install additional storage shelves in pantry	In Progress	\N
30	18	26	2025-12-01 12:00:00+00	17	hi	In Progress	\N
31	19	27	2025-12-01 14:00:00+00	17	aefaef	Completed	\N
32	17	28	2025-12-16 08:00:00+00	16	Broken pipe need to be fixed.	Completed	\N
34	21	30	2025-12-04 12:00:00+00	28	fix asap.	Completed	https://storage.googleapis.com/vargas-home-service-images/service-requests/34/27b681c0b16748318e2c1107c125673b.jpeg
35	22	31	2025-12-10 09:00:00+00	20	something	Pending	\N
\.


--
-- TOC entry 3520 (class 0 OID 65577)
-- Dependencies: 224
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.services (service_id, job_desc, service_price, service_type_id, job_name, duration_hours) FROM stdin;
1	Diagnose and fix leaking or dripping kitchen faucets, including basic part replacement.	120.00	1	Kitchen Faucet Repair	2.00
2	Troubleshoot non-working electrical outlets and perform minor repairs or replacements.	150.00	1	Outlet Troubleshooting & Fix	2.50
3	Patch small to medium drywall holes and repaint the affected area to blend with the wall.	180.00	1	Drywall Patch & Repaint	3.00
4	Prep and paint a standard-sized room with two coats of paint on walls.	350.00	2	Interior Wall Painting	6.00
5	Assemble customer-provided shelves and mount them securely to the wall.	90.00	2	Shelf Assembly & Installation	3.00
6	Power wash wooden decks or patios to remove dirt, mildew, and surface stains.	220.00	3	Deck Power Washing	4.00
7	Clear clogged toilets using augers or plungers; includes basic cleanup.	85.00	1	Toilet Unclogging	1.50
8	Repair or replace faulty door locks, handles, or latches for interior doors.	95.00	1	Door Lock Repair	2.00
9	Patch or replace damaged window screens for standard-size windows.	70.00	1	Window Screen Repair	1.50
10	Install customer-provided ceiling fan and connect to existing wiring.	140.00	2	Ceiling Fan Installation	2.50
11	Securely mount a flat-screen TV and conceal basic cable routing.	130.00	2	TV Wall Mounting	2.00
12	Remove old faucet and install a new kitchen faucet provided by the customer.	110.00	2	Kitchen Faucet Installation	2.00
13	Inspect and replace furnace or AC filters; basic system visual check.	75.00	3	Seasonal HVAC Filter Check	1.50
14	Clean leaves and debris from single-story home gutters and downspouts.	160.00	3	Gutter Cleaning	3.00
15	General inspection of exterior (siding, trim, steps, railings) for minor issues.	90.00	3	Exterior Walkthrough Inspection	2.00
16	After-hours visit to contain active pipe leaks and perform temporary repairs.	220.00	4	Emergency Pipe Leak Containment	2.00
17	Urgent troubleshooting of shorts, tripped breakers, or partial power loss.	210.00	4	Emergency Electrical Short Diagnosis	2.00
18	Temporary boarding, tarping, or bracing after storm damage.	250.00	4	Storm Damage Temporary Repair	3.00
19	Detailed cleaning of kitchen surfaces, appliances exterior, cabinets fronts, and floors.	200.00	5	Kitchen Deep Cleaning	4.00
20	Intensive cleaning of bathroom tile, grout, fixtures, and glass.	150.00	5	Bathroom Deep Cleaning	3.00
21	Prepare a new home or apartment with top-to-bottom deep cleaning before move-in.	300.00	5	Move-In Deep Cleaning	5.00
28	fix faucet.	400.00	1	Fix faucet	2.00
\.


--
-- TOC entry 3522 (class 0 OID 65659)
-- Dependencies: 226
-- Data for Name: specialties; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.specialties (specialty_id, specialty_name) FROM stdin;
1	Plumbing
2	Electrical
3	Carpentry
4	Painting
5	Landscaping
6	General Cleaning
\.


--
-- TOC entry 3529 (class 0 OID 65712)
-- Dependencies: 233
-- Data for Name: warranties; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.warranties (warranty_id, start_date, end_date, description, request_id, price, status) FROM stdin;
1	2025-10-05	2025-12-31	Warranty on kitchen faucet repair (parts & labor).	1	40.00	Active
2	2025-10-15	2025-12-15	Warranty on interior wall painting touch-ups.	2	60.00	Inactive
3	2025-11-02	2025-12-31	Warranty on installed wall shelves (stability & mounting).	3	35.00	Active
4	2025-11-20	2025-12-31	Warranty on electrical outlet repair (same issue only).	4	50.00	Active
6	2025-12-15	2025-12-31	Warranty on drywall patch and repaint (cracks/peeling).	6	45.00	Active
7	2025-10-02	2026-10-02	Warranty for job: Replace bathroom sink faucet leaking slowly	7	29.00	Active
8	2025-10-04	2026-10-04	Warranty for job: Repaint small bedroom accent wall	8	44.00	Active
9	2025-10-07	2026-10-07	Warranty for job: Repair loose interior door handle	9	19.00	Active
10	2025-10-18	2026-10-18	Warranty for job: Clean gutters on single-story home	10	36.00	Active
11	2025-11-01	2026-11-01	Warranty for job: Fix running toilet in main bathroom	13	26.00	Active
13	2025-11-10	2026-11-10	Warranty for job: Seasonal HVAC filter replacement	15	18.00	Active
14	2025-11-16	2026-11-16	Warranty for job: Emergency visit for water dripping from ceiling	16	48.00	Active
15	2025-12-03	2026-12-03	Warranty for job: Bathroom deep cleaning before guests arrive	19	30.00	Active
16	2025-12-05	2026-12-05	Warranty for job: Install kitchen backsplash lighting	20	42.00	Active
17	2025-12-09	2026-12-09	Warranty for job: Repair squeaky wooden steps	21	35.00	Active
12	2025-11-06	2026-11-06	Warranty for job: Mount 55-inch TV in living room	14	38.00	Pending
18	2025-11-27	2026-07-27	$5 deductible	32	10.00	Pending
19	2025-12-02	2026-10-13	demo	32	124.00	Active
20	2025-12-02	2026-12-02	Partially paid for materials	34	5.00	Active
\.


--
-- TOC entry 3525 (class 0 OID 65682)
-- Dependencies: 229
-- Data for Name: work_assignments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.work_assignments (assignment_id, requestid, employeeid) FROM stdin;
7	1	1
8	2	2
9	3	3
10	4	4
11	6	6
12	7	1
13	8	2
14	9	3
15	10	4
16	11	5
18	13	1
19	14	2
20	15	3
21	16	4
22	17	5
23	18	6
24	19	7
25	20	8
26	21	9
28	23	3
29	24	6
30	25	2
31	26	1
34	29	4
35	30	5
36	31	5
37	32	7
39	34	15
40	35	2
\.


--
-- TOC entry 3561 (class 0 OID 0)
-- Dependencies: 235
-- Name: addressbook_addressid_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.addressbook_addressid_seq', 31, true);


--
-- TOC entry 3562 (class 0 OID 0)
-- Dependencies: 234
-- Name: customer_customerid_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.customer_customerid_seq', 22, true);


--
-- TOC entry 3563 (class 0 OID 0)
-- Dependencies: 240
-- Name: empavailability_availability_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.empavailability_availability_id_seq', 13, true);


--
-- TOC entry 3564 (class 0 OID 0)
-- Dependencies: 236
-- Name: employee_employeeid_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.employee_employeeid_seq', 15, true);


--
-- TOC entry 3565 (class 0 OID 0)
-- Dependencies: 230
-- Name: estimates_estimate_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.estimates_estimate_id_seq', 40, true);


--
-- TOC entry 3566 (class 0 OID 0)
-- Dependencies: 243
-- Name: finance_categories_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.finance_categories_category_id_seq', 5, true);


--
-- TOC entry 3567 (class 0 OID 0)
-- Dependencies: 245
-- Name: finance_transactions_txn_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.finance_transactions_txn_id_seq', 34, true);


--
-- TOC entry 3568 (class 0 OID 0)
-- Dependencies: 247
-- Name: password_reset_tokens_token_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.password_reset_tokens_token_id_seq', 10, true);


--
-- TOC entry 3569 (class 0 OID 0)
-- Dependencies: 221
-- Name: reviews_review_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.reviews_review_id_seq', 17, true);


--
-- TOC entry 3570 (class 0 OID 0)
-- Dependencies: 238
-- Name: service_types_service_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.service_types_service_type_id_seq', 5, true);


--
-- TOC entry 3571 (class 0 OID 0)
-- Dependencies: 237
-- Name: servicerequests_requestid_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.servicerequests_requestid_seq', 35, true);


--
-- TOC entry 3572 (class 0 OID 0)
-- Dependencies: 223
-- Name: services_service_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.services_service_id_seq', 28, true);


--
-- TOC entry 3573 (class 0 OID 0)
-- Dependencies: 225
-- Name: specialties_specialty_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.specialties_specialty_id_seq', 6, true);


--
-- TOC entry 3574 (class 0 OID 0)
-- Dependencies: 232
-- Name: warranties_warranty_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.warranties_warranty_id_seq', 20, true);


--
-- TOC entry 3575 (class 0 OID 0)
-- Dependencies: 228
-- Name: work_assignments_assignment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.work_assignments_assignment_id_seq', 40, true);


--
-- TOC entry 3307 (class 2606 OID 57425)
-- Name: addressbook addressbook_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.addressbook
    ADD CONSTRAINT addressbook_pkey PRIMARY KEY (address_id);


--
-- TOC entry 3301 (class 2606 OID 57415)
-- Name: customer customer_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer
    ADD CONSTRAINT customer_pkey PRIMARY KEY (customerid);


--
-- TOC entry 3334 (class 2606 OID 139318)
-- Name: empavailability empavailability_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.empavailability
    ADD CONSTRAINT empavailability_pkey PRIMARY KEY (availability_id);


--
-- TOC entry 3303 (class 2606 OID 57420)
-- Name: employee employee_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee
    ADD CONSTRAINT employee_pkey PRIMARY KEY (employeeid);


--
-- TOC entry 3322 (class 2606 OID 106511)
-- Name: employee_specialties empspecpk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_specialties
    ADD CONSTRAINT empspecpk PRIMARY KEY (employeeid, specialty_id);


--
-- TOC entry 3326 (class 2606 OID 65705)
-- Name: finalpricedetails finalPrice_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finalpricedetails
    ADD CONSTRAINT "finalPrice_pkey" PRIMARY KEY (finalprice_id);


--
-- TOC entry 3338 (class 2606 OID 155683)
-- Name: finance_categories finance_categories_category_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_categories
    ADD CONSTRAINT finance_categories_category_name_key UNIQUE (category_name);


--
-- TOC entry 3340 (class 2606 OID 155681)
-- Name: finance_categories finance_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_categories
    ADD CONSTRAINT finance_categories_pkey PRIMARY KEY (category_id);


--
-- TOC entry 3342 (class 2606 OID 155696)
-- Name: finance_transactions finance_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_transactions
    ADD CONSTRAINT finance_transactions_pkey PRIMARY KEY (txn_id);


--
-- TOC entry 3344 (class 2606 OID 204807)
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (token_id);


--
-- TOC entry 3346 (class 2606 OID 204809)
-- Name: password_reset_tokens password_reset_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_token_key UNIQUE (token);


--
-- TOC entry 3311 (class 2606 OID 65565)
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (review_id);


--
-- TOC entry 3336 (class 2606 OID 155652)
-- Name: service_type_specialties service_type_specialties_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_type_specialties
    ADD CONSTRAINT service_type_specialties_pkey PRIMARY KEY (service_type_id, specialty_id);


--
-- TOC entry 3330 (class 2606 OID 131078)
-- Name: service_types service_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_types
    ADD CONSTRAINT service_types_pkey PRIMARY KEY (service_type_id);


--
-- TOC entry 3332 (class 2606 OID 131080)
-- Name: service_types service_types_service_type_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_types
    ADD CONSTRAINT service_types_service_type_name_key UNIQUE (service_type_name);


--
-- TOC entry 3309 (class 2606 OID 57435)
-- Name: servicerequests servicerequests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.servicerequests
    ADD CONSTRAINT servicerequests_pkey PRIMARY KEY (requestid);


--
-- TOC entry 3316 (class 2606 OID 65582)
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (service_id);


--
-- TOC entry 3320 (class 2606 OID 65665)
-- Name: specialties specialties_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.specialties
    ADD CONSTRAINT specialties_pkey PRIMARY KEY (specialty_id);


--
-- TOC entry 3305 (class 2606 OID 139290)
-- Name: employee unique_username; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee
    ADD CONSTRAINT unique_username UNIQUE (username);


--
-- TOC entry 3313 (class 2606 OID 172045)
-- Name: reviews uq_review_request_customer; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT uq_review_request_customer UNIQUE (request_id, customer_id);


--
-- TOC entry 3318 (class 2606 OID 131090)
-- Name: services uq_services_type_job; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT uq_services_type_job UNIQUE (service_type_id, job_name);


--
-- TOC entry 3328 (class 2606 OID 65718)
-- Name: warranties warranties_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warranties
    ADD CONSTRAINT warranties_pkey PRIMARY KEY (warranty_id);


--
-- TOC entry 3324 (class 2606 OID 65687)
-- Name: work_assignments work_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_assignments
    ADD CONSTRAINT work_assignments_pkey PRIMARY KEY (assignment_id);


--
-- TOC entry 3314 (class 1259 OID 131086)
-- Name: idx_services_service_type_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_services_service_type_id ON public.services USING btree (service_type_id);


--
-- TOC entry 3347 (class 2606 OID 57426)
-- Name: addressbook addressbook_customerid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.addressbook
    ADD CONSTRAINT addressbook_customerid_fkey FOREIGN KEY (customer_id) REFERENCES public.customer(customerid);


--
-- TOC entry 3361 (class 2606 OID 139319)
-- Name: empavailability empavailability_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.empavailability
    ADD CONSTRAINT empavailability_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employee(employeeid);


--
-- TOC entry 3364 (class 2606 OID 155707)
-- Name: finance_transactions finance_transactions_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_transactions
    ADD CONSTRAINT finance_transactions_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.finance_categories(category_id) ON DELETE SET NULL;


--
-- TOC entry 3365 (class 2606 OID 155702)
-- Name: finance_transactions finance_transactions_employeeid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_transactions
    ADD CONSTRAINT finance_transactions_employeeid_fkey FOREIGN KEY (employeeid) REFERENCES public.employee(employeeid) ON DELETE SET NULL;


--
-- TOC entry 3366 (class 2606 OID 196608)
-- Name: finance_transactions finance_transactions_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_transactions
    ADD CONSTRAINT finance_transactions_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.servicerequests(requestid) ON DELETE CASCADE;


--
-- TOC entry 3352 (class 2606 OID 65571)
-- Name: reviews fk_customer; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT fk_customer FOREIGN KEY (customer_id) REFERENCES public.customer(customerid);


--
-- TOC entry 3348 (class 2606 OID 114688)
-- Name: addressbook fk_customer_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.addressbook
    ADD CONSTRAINT fk_customer_id FOREIGN KEY (customer_id) REFERENCES public.customer(customerid) ON DELETE CASCADE;


--
-- TOC entry 3355 (class 2606 OID 65671)
-- Name: employee_specialties fk_employee; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_specialties
    ADD CONSTRAINT fk_employee FOREIGN KEY (employeeid) REFERENCES public.employee(employeeid);


--
-- TOC entry 3357 (class 2606 OID 65693)
-- Name: work_assignments fk_employee; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_assignments
    ADD CONSTRAINT fk_employee FOREIGN KEY (employeeid) REFERENCES public.employee(employeeid) ON DELETE CASCADE;


--
-- TOC entry 3354 (class 2606 OID 131081)
-- Name: services fk_services_service_type; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT fk_services_service_type FOREIGN KEY (service_type_id) REFERENCES public.service_types(service_type_id) ON DELETE RESTRICT;


--
-- TOC entry 3367 (class 2606 OID 204810)
-- Name: password_reset_tokens password_reset_tokens_employeeid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_employeeid_fkey FOREIGN KEY (employeeid) REFERENCES public.employee(employeeid) ON DELETE CASCADE;


--
-- TOC entry 3362 (class 2606 OID 155653)
-- Name: service_type_specialties service_type_specialties_service_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_type_specialties
    ADD CONSTRAINT service_type_specialties_service_type_id_fkey FOREIGN KEY (service_type_id) REFERENCES public.service_types(service_type_id) ON DELETE CASCADE;


--
-- TOC entry 3363 (class 2606 OID 155658)
-- Name: service_type_specialties service_type_specialties_specialty_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_type_specialties
    ADD CONSTRAINT service_type_specialties_specialty_id_fkey FOREIGN KEY (specialty_id) REFERENCES public.specialties(specialty_id) ON DELETE RESTRICT;


--
-- TOC entry 3360 (class 2606 OID 139272)
-- Name: warranties servicerequest_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warranties
    ADD CONSTRAINT servicerequest_fk FOREIGN KEY (request_id) REFERENCES public.servicerequests(requestid) ON DELETE SET NULL;


--
-- TOC entry 3359 (class 2606 OID 139279)
-- Name: finalpricedetails servicerequest_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finalpricedetails
    ADD CONSTRAINT servicerequest_fk FOREIGN KEY (request_id) REFERENCES public.servicerequests(requestid) ON DELETE SET NULL;


--
-- TOC entry 3353 (class 2606 OID 139284)
-- Name: reviews servicerequest_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT servicerequest_fk FOREIGN KEY (request_id) REFERENCES public.servicerequests(requestid) ON DELETE SET NULL;


--
-- TOC entry 3349 (class 2606 OID 57441)
-- Name: servicerequests servicerequests_addressid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.servicerequests
    ADD CONSTRAINT servicerequests_addressid_fkey FOREIGN KEY (addressid) REFERENCES public.addressbook(address_id);


--
-- TOC entry 3350 (class 2606 OID 57436)
-- Name: servicerequests servicerequests_customerid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.servicerequests
    ADD CONSTRAINT servicerequests_customerid_fkey FOREIGN KEY (customerid) REFERENCES public.customer(customerid);


--
-- TOC entry 3351 (class 2606 OID 73728)
-- Name: servicerequests servicerequests_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.servicerequests
    ADD CONSTRAINT servicerequests_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(service_id);


--
-- TOC entry 3356 (class 2606 OID 106505)
-- Name: employee_specialties specialtyfk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_specialties
    ADD CONSTRAINT specialtyfk FOREIGN KEY (specialty_id) REFERENCES public.specialties(specialty_id);


--
-- TOC entry 3358 (class 2606 OID 122889)
-- Name: work_assignments work_assignments_requestid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_assignments
    ADD CONSTRAINT work_assignments_requestid_fkey FOREIGN KEY (requestid) REFERENCES public.servicerequests(requestid) ON DELETE CASCADE;


-- Completed on 2025-12-03 13:06:42

--
-- PostgreSQL database dump complete
--

\unrestrict EhzlbHMBpiW0LldBueF9sLTgTrRchbTrCbgfwAi6LU4JeaYcc0gxyoNAbmCG7F8

