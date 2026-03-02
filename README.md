project description:
This project designs and implements a relational database for a music streaming platform called StreamIQ. The system models core entities such as users, artists, albums, songs, playlists, listen history, and streaming analytics, while accurately capturing complex relationships like song credits (many-to-many), user-artist follows, and playlist ordering. Every play event is logged with timestamps and duration to support royalty attribution, personalized recommendations, and monthly listening summaries. The schema is normalized to BCNF using functional dependencies to ensure data integrity and eliminate redundancy, and it is fully realized in SQLite3 with primary keys, foreign keys, and domain constraints enforced through SQL DDL statements.

AI usage disclose:
I used ChatGPT (GPT-5.2) as a development assistant to review and refine my UML diagram structure, helping me correct multiplicities, relationships, and overall model consistency before translating it into a relational schema. The model also assisted in generating sample test data and SQL table definitions, which I reviewed, adjusted, and validated to ensure they met the project requirements and normalization standards.

uml diagram url:

erd diagram url: https://lucid.app/lucidchart/2494d36e-d23b-486d-ba1d-4e3ead02742b/edit?invitationId=inv_3f3e7ebf-e861-43d4-977a-196e02c1bb15&page=0_0#
