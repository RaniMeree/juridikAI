--
-- PostgreSQL database dump
--

\restrict ukVtTGLcY63YEqZqydPFgfXpHbXwqsBJrM92R5W1fc2efOE3esSmlgjBDNVV2UV

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

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

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscriptions (
    subscription_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    stripe_customer_id character varying(255),
    stripe_subscription_id character varying(255),
    plan_type character varying(20) DEFAULT 'monthly'::character varying,
    status character varying(20) DEFAULT 'active'::character varying,
    current_period_start timestamp with time zone,
    current_period_end timestamp with time zone,
    cancel_at_period_end boolean DEFAULT false,
    query_limit integer DEFAULT 100,
    queries_used integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT subscriptions_plan_type_check CHECK (((plan_type)::text = ANY ((ARRAY['monthly'::character varying, 'yearly'::character varying, 'trial'::character varying])::text[]))),
    CONSTRAINT subscriptions_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'cancelled'::character varying, 'expired'::character varying, 'past_due'::character varying])::text[])))
);


ALTER TABLE public.subscriptions OWNER TO postgres;

--
-- Name: TABLE subscriptions; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.subscriptions IS 'Manages Stripe subscription plans and usage limits';


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    phone character varying(20),
    role character varying(20) DEFAULT 'user'::character varying,
    account_status character varying(20) DEFAULT 'active'::character varying,
    email_verified boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    last_login_at timestamp with time zone,
    CONSTRAINT users_account_status_check CHECK (((account_status)::text = ANY ((ARRAY['active'::character varying, 'suspended'::character varying, 'deleted'::character varying])::text[]))),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['user'::character varying, 'admin'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: TABLE users; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.users IS 'Stores user account information and authentication data';


--
-- Name: active_users_with_subscriptions; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.active_users_with_subscriptions AS
 SELECT u.user_id,
    u.email,
    u.first_name,
    u.last_name,
    u.created_at AS user_since,
    s.plan_type,
    s.status AS subscription_status,
    s.queries_used,
    s.query_limit,
    s.current_period_end
   FROM (public.users u
     LEFT JOIN public.subscriptions s ON ((u.user_id = s.user_id)))
  WHERE ((u.account_status)::text = 'active'::text);


ALTER VIEW public.active_users_with_subscriptions OWNER TO postgres;

--
-- Name: admin_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_logs (
    log_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    admin_id uuid NOT NULL,
    action character varying(100) NOT NULL,
    target_type character varying(50),
    target_id uuid,
    details jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.admin_logs OWNER TO postgres;

--
-- Name: TABLE admin_logs; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.admin_logs IS 'Audit trail of admin actions';


--
-- Name: conversations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conversations (
    conversation_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    title character varying(255),
    status character varying(20) DEFAULT 'active'::character varying,
    message_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    last_message_at timestamp with time zone,
    CONSTRAINT conversations_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'archived'::character varying])::text[])))
);


ALTER TABLE public.conversations OWNER TO postgres;

--
-- Name: TABLE conversations; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.conversations IS 'Stores chat conversation sessions between users and AI';


--
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    message_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    conversation_id uuid NOT NULL,
    role character varying(20) NOT NULL,
    content text NOT NULL,
    sources jsonb DEFAULT '[]'::jsonb,
    attached_documents jsonb DEFAULT '[]'::jsonb,
    tokens_used integer DEFAULT 0,
    response_time integer,
    feedback character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT messages_feedback_check CHECK (((feedback)::text = ANY ((ARRAY['helpful'::character varying, 'not_helpful'::character varying, NULL::character varying])::text[]))),
    CONSTRAINT messages_role_check CHECK (((role)::text = ANY ((ARRAY['user'::character varying, 'assistant'::character varying, 'system'::character varying])::text[])))
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- Name: TABLE messages; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.messages IS 'Individual messages within conversations';


--
-- Name: conversation_summary; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.conversation_summary AS
 SELECT c.conversation_id,
    c.user_id,
    c.title,
    c.created_at,
    c.last_message_at,
    count(m.message_id) AS total_messages,
    sum(
        CASE
            WHEN ((m.role)::text = 'user'::text) THEN 1
            ELSE 0
        END) AS user_messages,
    sum(
        CASE
            WHEN ((m.role)::text = 'assistant'::text) THEN 1
            ELSE 0
        END) AS assistant_messages
   FROM (public.conversations c
     LEFT JOIN public.messages m ON ((c.conversation_id = m.conversation_id)))
  GROUP BY c.conversation_id, c.user_id, c.title, c.created_at, c.last_message_at;


ALTER VIEW public.conversation_summary OWNER TO postgres;

--
-- Name: legal_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.legal_documents (
    document_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    file_name character varying(255) NOT NULL,
    file_url text NOT NULL,
    file_size bigint,
    file_type character varying(20),
    category character varying(100),
    jurisdiction character varying(100),
    language character varying(10) DEFAULT 'sv'::character varying,
    status character varying(20) DEFAULT 'uploading'::character varying,
    chunk_count integer DEFAULT 0,
    uploaded_by uuid,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT legal_documents_file_type_check CHECK (((file_type)::text = ANY ((ARRAY['pdf'::character varying, 'docx'::character varying, 'txt'::character varying])::text[]))),
    CONSTRAINT legal_documents_status_check CHECK (((status)::text = ANY ((ARRAY['uploading'::character varying, 'processing'::character varying, 'indexed'::character varying, 'failed'::character varying])::text[])))
);


ALTER TABLE public.legal_documents OWNER TO postgres;

--
-- Name: TABLE legal_documents; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.legal_documents IS 'Admin-uploaded legal knowledge base documents';


--
-- Name: payment_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_history (
    payment_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    subscription_id uuid,
    stripe_payment_intent_id character varying(255),
    amount numeric(10,2) NOT NULL,
    currency character varying(3) DEFAULT 'SEK'::character varying,
    status character varying(20) DEFAULT 'pending'::character varying,
    payment_method character varying(50),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT payment_history_status_check CHECK (((status)::text = ANY ((ARRAY['succeeded'::character varying, 'failed'::character varying, 'pending'::character varying, 'refunded'::character varying])::text[])))
);


ALTER TABLE public.payment_history OWNER TO postgres;

--
-- Name: query_analytics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.query_analytics (
    query_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    conversation_id uuid,
    message_id uuid,
    query text NOT NULL,
    retrieved_documents jsonb DEFAULT '[]'::jsonb,
    relevance_scores jsonb DEFAULT '[]'::jsonb,
    response_generated boolean DEFAULT false,
    error_occurred boolean DEFAULT false,
    error_message text,
    processing_time integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.query_analytics OWNER TO postgres;

--
-- Name: TABLE query_analytics; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.query_analytics IS 'Performance tracking and analytics for RAG queries';


--
-- Name: user_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_documents (
    user_document_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    conversation_id uuid,
    file_name character varying(255) NOT NULL,
    file_url text NOT NULL,
    file_size bigint,
    file_type character varying(20),
    upload_status character varying(20) DEFAULT 'uploading'::character varying,
    processing_error text,
    extracted_text text,
    page_count integer,
    is_active boolean DEFAULT true,
    uploaded_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    processed_at timestamp with time zone,
    CONSTRAINT user_documents_file_type_check CHECK (((file_type)::text = ANY ((ARRAY['pdf'::character varying, 'docx'::character varying, 'doc'::character varying])::text[]))),
    CONSTRAINT user_documents_upload_status_check CHECK (((upload_status)::text = ANY ((ARRAY['uploading'::character varying, 'processing'::character varying, 'ready'::character varying, 'failed'::character varying])::text[])))
);


ALTER TABLE public.user_documents OWNER TO postgres;

--
-- Name: TABLE user_documents; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.user_documents IS 'User-uploaded documents for personalized queries';


--
-- Name: user_feedback; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_feedback (
    feedback_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    message_id uuid NOT NULL,
    rating integer,
    comment text,
    feedback_type character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT user_feedback_feedback_type_check CHECK (((feedback_type)::text = ANY ((ARRAY['helpful'::character varying, 'not_helpful'::character varying, 'incorrect'::character varying, 'offensive'::character varying])::text[]))),
    CONSTRAINT user_feedback_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.user_feedback OWNER TO postgres;

--
-- Name: TABLE user_feedback; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.user_feedback IS 'User feedback on AI responses for improvement';


--
-- Data for Name: admin_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_logs (log_id, admin_id, action, target_type, target_id, details, created_at) FROM stdin;
\.


--
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conversations (conversation_id, user_id, title, status, message_count, created_at, updated_at, last_message_at) FROM stdin;
\.


--
-- Data for Name: legal_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.legal_documents (document_id, file_name, file_url, file_size, file_type, category, jurisdiction, language, status, chunk_count, uploaded_by, metadata, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (message_id, conversation_id, role, content, sources, attached_documents, tokens_used, response_time, feedback, created_at) FROM stdin;
\.


--
-- Data for Name: payment_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_history (payment_id, user_id, subscription_id, stripe_payment_intent_id, amount, currency, status, payment_method, created_at) FROM stdin;
\.


--
-- Data for Name: query_analytics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.query_analytics (query_id, user_id, conversation_id, message_id, query, retrieved_documents, relevance_scores, response_generated, error_occurred, error_message, processing_time, created_at) FROM stdin;
\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscriptions (subscription_id, user_id, stripe_customer_id, stripe_subscription_id, plan_type, status, current_period_start, current_period_end, cancel_at_period_end, query_limit, queries_used, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_documents (user_document_id, user_id, conversation_id, file_name, file_url, file_size, file_type, upload_status, processing_error, extracted_text, page_count, is_active, uploaded_at, processed_at) FROM stdin;
\.


--
-- Data for Name: user_feedback; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_feedback (feedback_id, user_id, message_id, rating, comment, feedback_type, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, email, password_hash, first_name, last_name, phone, role, account_status, email_verified, created_at, updated_at, last_login_at) FROM stdin;
ac2db740-622a-441e-8016-11f6cb151544	admin@annalegal.se	$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWU2u3ZG	Admin	User	\N	admin	active	t	2026-01-14 03:54:07.990293+01	2026-01-14 03:54:07.990293+01	\N
ca85e504-e1ca-4a12-a70c-7afe15e0cce3	sdf@dfd.com	$2b$12$0AOvPWSIKH6G5X5/IlgOauV4j7ypX.8p7fY4WF03fk/Rw0mdmLdJ2	aaasd	dfd	\N	user	active	f	2026-01-14 03:31:45.327167+01	2026-01-14 03:31:45.327167+01	\N
\.


--
-- Name: admin_logs admin_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_logs
    ADD CONSTRAINT admin_logs_pkey PRIMARY KEY (log_id);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (conversation_id);


--
-- Name: legal_documents legal_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.legal_documents
    ADD CONSTRAINT legal_documents_pkey PRIMARY KEY (document_id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (message_id);


--
-- Name: payment_history payment_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_history
    ADD CONSTRAINT payment_history_pkey PRIMARY KEY (payment_id);


--
-- Name: query_analytics query_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.query_analytics
    ADD CONSTRAINT query_analytics_pkey PRIMARY KEY (query_id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (subscription_id);


--
-- Name: subscriptions subscriptions_stripe_customer_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_stripe_customer_id_key UNIQUE (stripe_customer_id);


--
-- Name: subscriptions subscriptions_stripe_subscription_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_stripe_subscription_id_key UNIQUE (stripe_subscription_id);


--
-- Name: user_documents user_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_documents
    ADD CONSTRAINT user_documents_pkey PRIMARY KEY (user_document_id);


--
-- Name: user_feedback user_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_feedback
    ADD CONSTRAINT user_feedback_pkey PRIMARY KEY (feedback_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: idx_admin_logs_action; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_admin_logs_action ON public.admin_logs USING btree (action);


--
-- Name: idx_admin_logs_admin_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_admin_logs_admin_id ON public.admin_logs USING btree (admin_id);


--
-- Name: idx_admin_logs_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_admin_logs_created_at ON public.admin_logs USING btree (created_at);


--
-- Name: idx_conversations_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_conversations_created_at ON public.conversations USING btree (created_at);


--
-- Name: idx_conversations_last_message_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_conversations_last_message_at ON public.conversations USING btree (last_message_at);


--
-- Name: idx_conversations_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_conversations_user_id ON public.conversations USING btree (user_id);


--
-- Name: idx_legal_documents_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_legal_documents_category ON public.legal_documents USING btree (category);


--
-- Name: idx_legal_documents_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_legal_documents_created_at ON public.legal_documents USING btree (created_at);


--
-- Name: idx_legal_documents_jurisdiction; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_legal_documents_jurisdiction ON public.legal_documents USING btree (jurisdiction);


--
-- Name: idx_legal_documents_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_legal_documents_status ON public.legal_documents USING btree (status);


--
-- Name: idx_messages_conversation_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_conversation_id ON public.messages USING btree (conversation_id);


--
-- Name: idx_messages_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_created_at ON public.messages USING btree (created_at);


--
-- Name: idx_messages_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_role ON public.messages USING btree (role);


--
-- Name: idx_payment_history_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_history_created_at ON public.payment_history USING btree (created_at);


--
-- Name: idx_payment_history_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_history_status ON public.payment_history USING btree (status);


--
-- Name: idx_payment_history_subscription_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_history_subscription_id ON public.payment_history USING btree (subscription_id);


--
-- Name: idx_payment_history_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_history_user_id ON public.payment_history USING btree (user_id);


--
-- Name: idx_query_analytics_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_query_analytics_created_at ON public.query_analytics USING btree (created_at);


--
-- Name: idx_query_analytics_error_occurred; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_query_analytics_error_occurred ON public.query_analytics USING btree (error_occurred);


--
-- Name: idx_query_analytics_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_query_analytics_user_id ON public.query_analytics USING btree (user_id);


--
-- Name: idx_subscriptions_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subscriptions_status ON public.subscriptions USING btree (status);


--
-- Name: idx_subscriptions_stripe_customer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subscriptions_stripe_customer_id ON public.subscriptions USING btree (stripe_customer_id);


--
-- Name: idx_subscriptions_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions USING btree (user_id);


--
-- Name: idx_user_documents_conversation_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_documents_conversation_id ON public.user_documents USING btree (conversation_id);


--
-- Name: idx_user_documents_upload_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_documents_upload_status ON public.user_documents USING btree (upload_status);


--
-- Name: idx_user_documents_uploaded_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_documents_uploaded_at ON public.user_documents USING btree (uploaded_at);


--
-- Name: idx_user_documents_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_documents_user_id ON public.user_documents USING btree (user_id);


--
-- Name: idx_user_feedback_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_feedback_created_at ON public.user_feedback USING btree (created_at);


--
-- Name: idx_user_feedback_message_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_feedback_message_id ON public.user_feedback USING btree (message_id);


--
-- Name: idx_user_feedback_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_feedback_user_id ON public.user_feedback USING btree (user_id);


--
-- Name: idx_users_account_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_account_status ON public.users USING btree (account_status);


--
-- Name: idx_users_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_created_at ON public.users USING btree (created_at);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: conversations update_conversations_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: legal_documents update_legal_documents_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_legal_documents_updated_at BEFORE UPDATE ON public.legal_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: subscriptions update_subscriptions_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: admin_logs admin_logs_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_logs
    ADD CONSTRAINT admin_logs_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: conversations conversations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: legal_documents legal_documents_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.legal_documents
    ADD CONSTRAINT legal_documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: messages messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(conversation_id) ON DELETE CASCADE;


--
-- Name: payment_history payment_history_subscription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_history
    ADD CONSTRAINT payment_history_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(subscription_id) ON DELETE SET NULL;


--
-- Name: payment_history payment_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_history
    ADD CONSTRAINT payment_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: query_analytics query_analytics_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.query_analytics
    ADD CONSTRAINT query_analytics_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(conversation_id) ON DELETE SET NULL;


--
-- Name: query_analytics query_analytics_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.query_analytics
    ADD CONSTRAINT query_analytics_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(message_id) ON DELETE SET NULL;


--
-- Name: query_analytics query_analytics_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.query_analytics
    ADD CONSTRAINT query_analytics_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: subscriptions subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: user_documents user_documents_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_documents
    ADD CONSTRAINT user_documents_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(conversation_id) ON DELETE SET NULL;


--
-- Name: user_documents user_documents_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_documents
    ADD CONSTRAINT user_documents_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: user_feedback user_feedback_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_feedback
    ADD CONSTRAINT user_feedback_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(message_id) ON DELETE CASCADE;


--
-- Name: user_feedback user_feedback_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_feedback
    ADD CONSTRAINT user_feedback_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict ukVtTGLcY63YEqZqydPFgfXpHbXwqsBJrM92R5W1fc2efOE3esSmlgjBDNVV2UV

