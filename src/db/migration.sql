CREATE TABLE IF NOT EXISTS github_owner
(
    id                UUID         NOT NULL DEFAULT gen_random_uuid(),
    github_id         INTEGER PRIMARY KEY,
    github_login      VARCHAR(255) NOT NULL UNIQUE,

    github_type       VARCHAR(127) NOT NULL,
    github_html_url   VARCHAR(510) NOT NULL,
    github_avatar_url VARCHAR(510),

    created_at        TIMESTAMP    NOT NULL DEFAULT now(),
    updated_at        TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS github_repository
(
    id                 UUID         NOT NULL DEFAULT gen_random_uuid(),
    github_id          INTEGER UNIQUE,

    github_owner_id    INTEGER      NOT NULL,
    github_owner_login VARCHAR(255) NOT NULL,

    github_name        VARCHAR(255) NOT NULL,

    github_html_url    VARCHAR(510) NOT NULL,
    github_description VARCHAR(510),

    created_at         TIMESTAMP    NOT NULL DEFAULT now(),
    updated_at         TIMESTAMP    NOT NULL DEFAULT now(),

    CONSTRAINT pk_github_repository PRIMARY KEY (github_owner_login, github_name),

    CONSTRAINT fk_github_owner_id FOREIGN KEY (github_owner_id) REFERENCES github_owner (github_id) ON DELETE RESTRICT,
    CONSTRAINT fk_github_owner_login FOREIGN KEY (github_owner_login) REFERENCES github_owner (github_login) ON DELETE RESTRICT
);

-- TODO: deal with the date format
-- github_created_at TIMESTAMP,
-- github_closed_at TIMESTAMP,
CREATE TABLE IF NOT EXISTS github_issue
(
    id                         UUID          NOT NULL DEFAULT gen_random_uuid(),
    github_id                  INTEGER UNIQUE,

    github_owner_id            INTEGER       NOT NULL,
    github_owner_login         VARCHAR(255)  NOT NULL,

    github_repository_id       INTEGER       NOT NULL,
    github_repository_name     VARCHAR(255)  NOT NULL,

    github_number              INTEGER       NOT NULL,

    github_open_by_owner_id    INTEGER,     -- ID of the owner who opened the issue
    github_open_by_owner_login VARCHAR(255),-- Login of the owner who opened the issue

    github_title               VARCHAR(510)  NOT NULL,
    github_body                VARCHAR(1020) NOT NULL,
    github_html_url            VARCHAR(510)  NOT NULL,
    github_created_at          VARCHAR(510),
    github_closed_at           VARCHAR(510),

    created_at                 TIMESTAMP     NOT NULL DEFAULT now(),
    updated_at                 TIMESTAMP     NOT NULL DEFAULT now(),

    CONSTRAINT pk_github_issue_key PRIMARY KEY (github_owner_login, github_repository_name, github_number),

    CONSTRAINT fk_github_owner_id FOREIGN KEY (github_owner_id) REFERENCES github_owner (github_id) ON DELETE RESTRICT,
    CONSTRAINT fk_github_owner_login FOREIGN KEY (github_owner_login) REFERENCES github_owner (github_login) ON DELETE RESTRICT,

    CONSTRAINT fk_github_repository_id FOREIGN KEY (github_repository_id) REFERENCES github_repository (github_id) ON DELETE RESTRICT,
    CONSTRAINT fk_github_repository FOREIGN KEY (github_owner_login, github_repository_name) REFERENCES github_repository (github_owner_login, github_name) ON DELETE RESTRICT,

    CONSTRAINT fk_github_open_by_owner_id FOREIGN KEY (github_open_by_owner_id) REFERENCES github_owner (github_id) ON DELETE RESTRICT,
    CONSTRAINT fk_github_open_by_owner_login FOREIGN KEY (github_open_by_owner_login) REFERENCES github_owner (github_login) ON DELETE RESTRICT
);


-- User authentication tables --

-- from passportjs.org
CREATE TABLE IF NOT EXISTS "user_session"
(
    "sid"    character varying NOT NULL COLLATE "default",
    "sess"   json              NOT NULL,
    "expire" TIMESTAMP         NOT NULL
) WITH (OIDS= FALSE);
ALTER TABLE "user_session"
    ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX "IDX_session_expire" ON "user_session" ("expire");

CREATE TABLE IF NOT EXISTS app_user
(
    id                 UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    provider           VARCHAR(50),         -- Optional, used for third-party users
    third_party_id     VARCHAR(100) UNIQUE, -- Optional, used for third-party users
    name               VARCHAR(255),
    email              VARCHAR(255) UNIQUE,
    is_email_verified  BOOLEAN          NOT NULL,
    hashed_password    VARCHAR(255),        -- Optional, used for local users
    role               VARCHAR(50)      NOT NULL,
    github_owner_id    INTEGER,
    github_owner_login VARCHAR(255),

    created_at         TIMESTAMP        NOT NULL DEFAULT now(),
    updated_at         TIMESTAMP        NOT NULL DEFAULT now(),

    CONSTRAINT fk_github_owner FOREIGN KEY (github_owner_id) REFERENCES github_owner (github_id) ON DELETE SET NULL,
    CONSTRAINT fk_github_owner_login FOREIGN KEY (github_owner_login) REFERENCES github_owner (github_login) ON DELETE RESTRICT,

    CONSTRAINT chk_provider CHECK (
            (provider IS NOT NULL AND third_party_id IS NOT NULL) OR
            (provider IS NULL AND third_party_id IS NULL)
        ),
    CONSTRAINT chk_github_provider_data CHECK (
            (provider = 'github' AND github_owner_id IS NOT NULL AND github_owner_login IS NOT NULL) OR
            (provider <> 'github' AND github_owner_id IS NULL AND github_owner_login IS NULL)
        )
);

CREATE TABLE IF NOT EXISTS address
(
    id          UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    name        VARCHAR(255),
    line_1      VARCHAR(255),
    line_2      VARCHAR(255),
    city        VARCHAR(100),
    state       VARCHAR(100),
    postal_code VARCHAR(20),
    country     VARCHAR(100),

    created_at  TIMESTAMP        NOT NULL DEFAULT now(),
    updated_at  TIMESTAMP        NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS company
(
    id         UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    tax_id     VARCHAR(50) UNIQUE,
    name       VARCHAR(255)     NOT NULL,
    address_id UUID,

    created_at TIMESTAMP        NOT NULL DEFAULT now(),
    updated_at TIMESTAMP        NOT NULL DEFAULT now(),

    CONSTRAINT fk_address FOREIGN KEY (address_id) REFERENCES address (id) ON DELETE RESTRICT
);

------------------------------------------------------
--- Junction tables for many-to-many relationships ---
------------------------------------------------------

CREATE TABLE IF NOT EXISTS user_company
(
    user_id    UUID,
    company_id UUID,
    role       VARCHAR(50) NOT NULL, -- The role of this user for this company: 'admin', 'suggest', 'read'

    created_at TIMESTAMP   NOT NULL DEFAULT now(),
    updated_at TIMESTAMP   NOT NULL DEFAULT now(),

    PRIMARY KEY (user_id, company_id),

    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES app_user (id) ON DELETE CASCADE,
    CONSTRAINT fk_company FOREIGN KEY (company_id) REFERENCES company (id) ON DELETE CASCADE
);

-- CREATE TABLE IF NOT EXISTS user_repository(
--     user_id                UUID,
--
--     github_owner_id        INTEGER      NOT NULL,
--     github_owner_login     VARCHAR(255) NOT NULL,
--
--     github_repository_id   INTEGER      NOT NULL,
--     github_repository_name VARCHAR(255) NOT NULL,
--
--     role                   VARCHAR(50)  NOT NULL, -- The role of this user for this repository
--
--     created_at             TIMESTAMP    NOT NULL DEFAULT now(),
--     updated_at             TIMESTAMP    NOT NULL DEFAULT now(),
--
--     PRIMARY KEY (user_id, github_owner_login, github_repository_name),
--
--     CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES app_user (id) ON DELETE CASCADE,
--
--     CONSTRAINT fk_github_owner_id FOREIGN KEY (github_owner_id) REFERENCES github_owner (github_id) ON DELETE RESTRICT,
--     CONSTRAINT fk_github_owner_login FOREIGN KEY (github_owner_login) REFERENCES github_owner (github_login) ON DELETE RESTRICT,
--
--     CONSTRAINT fk_github_repository_id FOREIGN KEY (github_repository_id) REFERENCES github_repository (github_id) ON DELETE RESTRICT,
--     CONSTRAINT fk_github_repository FOREIGN KEY (github_owner_login, github_repository_name) REFERENCES github_repository (github_owner_login, github_name) ON DELETE RESTRICT
-- );

---------------------
--- Stripe tables ---
---------------------

CREATE TABLE IF NOT EXISTS stripe_customer
(
    id         UUID        NOT NULL DEFAULT gen_random_uuid(),
    stripe_id  VARCHAR(50) NOT NULL PRIMARY KEY,
    user_id    UUID        NOT NULL,

    created_at TIMESTAMP   NOT NULL DEFAULT now(),
    updated_at TIMESTAMP   NOT NULL DEFAULT now(),

    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES app_user (id) ON DELETE CASCADE
);

-- example: represent the product 0.01 DoW
CREATE TABLE IF NOT EXISTS stripe_product
(
    id          UUID        NOT NULL DEFAULT gen_random_uuid(),
    stripe_id   VARCHAR(50) NOT NULL PRIMARY KEY,
    unit        VARCHAR(50) NOT NULL, -- 'DoW'
    unit_amount INTEGER     NOT NULL,
    recurring   BOOLEAN     NOT NULL,

    created_at  TIMESTAMP   NOT NULL DEFAULT now(),
    updated_at  TIMESTAMP   NOT NULL DEFAULT now(),

    CONSTRAINT positive_quantity CHECK (unit_amount > 0)
);

CREATE TABLE IF NOT EXISTS stripe_invoice
(
    id                 UUID           NOT NULL DEFAULT gen_random_uuid(),
    stripe_id          VARCHAR(50)    NOT NULL PRIMARY KEY,
    customer_id        VARCHAR(50)    NOT NULL,
    paid               BOOLEAN        NOT NULL,
    account_country    VARCHAR(255)   NOT NULL,
    currency           VARCHAR(10)    NOT NULL,
    total              NUMERIC(10, 2) NOT NULL,
    total_excl_tax     NUMERIC(10, 2) NOT NULL,
    subtotal           NUMERIC(10, 2) NOT NULL,
    subtotal_excl_tax  NUMERIC(10, 2) NOT NULL,
    hosted_invoice_url TEXT           NOT NULL,
    invoice_pdf        TEXT           NOT NULL,

    created_at         TIMESTAMP      NOT NULL DEFAULT now(),
    updated_at         TIMESTAMP      NOT NULL DEFAULT now(),

    CONSTRAINT fk_customer FOREIGN KEY (customer_id) REFERENCES stripe_customer (stripe_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS stripe_invoice_line
(
    id          UUID        NOT NULL DEFAULT gen_random_uuid(),
    stripe_id   VARCHAR(50) NOT NULL PRIMARY KEY,
    invoice_id  VARCHAR(50) NOT NULL,
    customer_id VARCHAR(50) NOT NULL,
    product_id  VARCHAR(50) NOT NULL,
    price_id    VARCHAR(50) NOT NULL,
    quantity    INTEGER     NOT NULL, -- Quantity of the product

    created_at  TIMESTAMP   NOT NULL DEFAULT now(),
    updated_at  TIMESTAMP   NOT NULL DEFAULT now(),

    CONSTRAINT fk_invoice FOREIGN KEY (invoice_id) REFERENCES stripe_invoice (stripe_id) ON DELETE CASCADE,
    CONSTRAINT fk_customer FOREIGN KEY (customer_id) REFERENCES stripe_customer (stripe_id) ON DELETE CASCADE,
    CONSTRAINT fk_product FOREIGN KEY (product_id) REFERENCES stripe_product (stripe_id) ON DELETE CASCADE,

    CONSTRAINT positive_quantity CHECK (quantity > 0)
);

-----------------------------
--- Manual invoice tables ---
-----------------------------

CREATE TABLE IF NOT EXISTS manual_invoice
(
    id         UUID           NOT NULL DEFAULT gen_random_uuid(),
    number     INTEGER        NOT NULL,
    company_id UUID,
    user_id    UUID,
    paid       BOOLEAN        NOT NULL DEFAULT true,
    dow_amount NUMERIC(10, 4) NOT NULL,

    created_at TIMESTAMP      NOT NULL DEFAULT now(),
    updated_at TIMESTAMP      NOT NULL DEFAULT now(),

    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES app_user (id) ON DELETE CASCADE,
    CONSTRAINT fk_company FOREIGN KEY (company_id) REFERENCES company (id) ON DELETE CASCADE,

    CONSTRAINT chk_company_nor_user CHECK (
            (company_id IS NOT NULL AND user_id IS NULL) OR
            (company_id IS NULL AND user_id IS NOT NULL)
        )
);

----------------------------
--- Issue funding tables ---
----------------------------

CREATE TABLE IF NOT EXISTS managed_issue
(
    id                     UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),

    github_owner_id        INTEGER          NOT NULL,
    github_owner_login     VARCHAR(255)     NOT NULL,

    github_repository_id   INTEGER          NOT NULL,
    github_repository_name VARCHAR(255)     NOT NULL,

    github_issue_id        INTEGER          NOT NULL,
    github_issue_number    INTEGER          NOT NULL,

    requested_dow_amount   NUMERIC(10, 4)   NOT NULL,

    manager_id             UUID             NOT NULL,
    contributor_visibility VARCHAR(50)      NOT NULL, -- 'public' or 'private'
    state                  VARCHAR(50)      NOT NULL, -- 'open', 'rejected', 'solved'

    created_at             TIMESTAMP        NOT NULL DEFAULT now(),
    updated_at             TIMESTAMP        NOT NULL DEFAULT now(),

    CONSTRAINT fk_github_owner_id FOREIGN KEY (github_owner_id) REFERENCES github_owner (github_id) ON DELETE RESTRICT,
    CONSTRAINT fk_github_repository_id FOREIGN KEY (github_repository_id) REFERENCES github_repository (github_id) ON DELETE RESTRICT,
    CONSTRAINT fk_github_issue_id FOREIGN KEY (github_issue_id) REFERENCES github_issue (github_id) ON DELETE RESTRICT,

    CONSTRAINT fk_github_owner_login FOREIGN KEY (github_owner_login) REFERENCES github_owner (github_login) ON DELETE RESTRICT,
    CONSTRAINT fk_github_repository FOREIGN KEY (github_owner_login, github_repository_name) REFERENCES github_repository (github_owner_login, github_name) ON DELETE RESTRICT,
    CONSTRAINT fk_github_issue FOREIGN KEY (github_owner_login, github_repository_name, github_issue_number) REFERENCES github_issue (github_owner_login, github_repository_name, github_number) ON DELETE RESTRICT,

    CONSTRAINT fk_manager FOREIGN KEY (manager_id) REFERENCES app_user (id) ON DELETE CASCADE
);

-- this table is used as event source events
CREATE TABLE IF NOT EXISTS issue_funding
(
    id                     UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),

    github_owner_id        INTEGER          NOT NULL,
    github_owner_login     VARCHAR(255)     NOT NULL,

    github_repository_id   INTEGER          NOT NULL,
    github_repository_name VARCHAR(255)     NOT NULL,

    github_issue_id        INTEGER          NOT NULL,
    github_issue_number    INTEGER          NOT NULL,

    user_id                UUID             NOT NULL,
    dow_amount             NUMERIC(10, 4)   NOT NULL,

    created_at             TIMESTAMP        NOT NULL DEFAULT now(),
    updated_at             TIMESTAMP        NOT NULL DEFAULT now(),

    CONSTRAINT fk_github_owner_id FOREIGN KEY (github_owner_id) REFERENCES github_owner (github_id) ON DELETE RESTRICT,
    CONSTRAINT fk_github_repository_id FOREIGN KEY (github_repository_id) REFERENCES github_repository (github_id) ON DELETE RESTRICT,
    CONSTRAINT fk_github_issue_id FOREIGN KEY (github_issue_id) REFERENCES github_issue (github_id) ON DELETE RESTRICT,

    CONSTRAINT fk_github_owner_login FOREIGN KEY (github_owner_login) REFERENCES github_owner (github_login) ON DELETE RESTRICT,
    CONSTRAINT fk_github_repository FOREIGN KEY (github_owner_login, github_repository_name) REFERENCES github_repository (github_owner_login, github_name) ON DELETE RESTRICT,
    CONSTRAINT fk_github_issue FOREIGN KEY (github_owner_login, github_repository_name, github_issue_number) REFERENCES github_issue (github_owner_login, github_repository_name, github_number) ON DELETE RESTRICT,

    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES app_user (id) ON DELETE CASCADE
);


-----------------------------------------
--- Tables to invite user to register ---
-----------------------------------------

CREATE TABLE IF NOT EXISTS company_user_permission_token
(
    id                UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    user_name         VARCHAR(255),
    user_email        VARCHAR(255)     NOT NULL,

    token             TEXT             NOT NULL UNIQUE,

    company_id        UUID             NOT NULL,
    company_user_role VARCHAR(50)      NOT NULL, -- 'admin', 'suggest', 'read'

    expires_at        TIMESTAMP        NOT NULL,
    created_at        TIMESTAMP        NOT NULL DEFAULT now(),
    updated_at        TIMESTAMP        NOT NULL DEFAULT now(),

    CONSTRAINT fk_company FOREIGN KEY (company_id) REFERENCES company (id) ON DELETE RESTRICT,
    CONSTRAINT unique_user_company UNIQUE (user_email, company_id)
);

CREATE TABLE IF NOT EXISTS repository_user_permission_token
(
    id                      UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    user_github_owner_login VARCHAR(255)     NOT NULL,

    token                   TEXT             NOT NULL UNIQUE,

    github_owner_login      VARCHAR(255)     NOT NULL,
    github_repository_name  VARCHAR(255)     NOT NULL,

    repository_user_role    VARCHAR(50)      NOT NULL, -- 'admin', 'read'

    expires_at              TIMESTAMP        NOT NULL,
    created_at              TIMESTAMP        NOT NULL DEFAULT now(),
    updated_at              TIMESTAMP        NOT NULL DEFAULT now(),

    CONSTRAINT fk_github_repository FOREIGN KEY (github_owner_login, github_repository_name) REFERENCES github_repository (github_owner_login, github_name) ON DELETE RESTRICT
);
