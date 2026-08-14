# Field-notes anonymization policy

This policy governs how X-Ops Media publishes content in the `field-notes` format. Field notes are articles derived from real-world incidents observed during X-Ops Consulting engagements. They are the most useful — and the most dangerous — format we publish: useful because the lessons are concrete, dangerous because the original engagement data is confidential.

The policy exists to make it auditable, before the first field note is published, exactly what is redacted, what is kept, who signs off, and where the originals live.

---

## ES — Anonimización de notas de campo

### Qué se anonimiza y qué no

**Se anonimiza (siempre):**

- Nombre del cliente y de cualquiera de sus empleados, contratistas o usuarios finales.
- Sector si es identificable (se mantienen solo referencias genéricas como «organización del sector sanitario europeo»).
- Direcciones IP exactas, rangos CIDR y nombres de host.
- Marcas de tiempo con granularidad menor a un día que permitan correlacionar con eventos del cliente.
- IoCs atribuibles (hashes de binarios, dominios, cuentas, tokens específicos del cliente).
- Nombres de productos internos, herramientas propietarias del cliente o scripts privados suyos.
- Cualquier cifra de negocio (número de empleados, ingresos, volumen de datos) que permita identificar al cliente.

**Se conserva (siempre):**

- La lección aprendida y la recomendación operativa.
- Las TTPs y técnicas observadas, expresadas en el vocabulario estándar (MITRE ATT&CK, etc.).
- La tooling genérica o pública que se usó.
- Patrones de diseño y antipatrones que el lector puede reconocer en sus propios entornos.

### Flujo de aprobación

Antes de publicar un field note, el **responsable del engagement en X-Ops Consulting** revisa el borrador y firma la aprobación. La firma es trazable y queda archivada asociada al slug del artículo. El editor jefe de X-Ops Media verifica que la aprobación existe y que la versión firmada coincide con la que entra en publicación.

### Retención

Los datos originales del engagement **no se conservan nunca en el lado editorial**. El dato original vive en el repositorio de X-Ops Consulting, bajo las políticas contractuales del cliente. Lo que pasa al lado editorial son las deltas: lo anonimizado y la lección aprendida. No hay sincronización entre los dos lados.

### Revisión

Esta política se revisa al menos una vez al año y siempre que cambien las prácticas de divulgación de X-Ops Consulting. La versión vigente está publicada en [xops.media/policies/field-notes-anonymization](https://xops.media/policies/field-notes-anonymization).

---

## EN — Field-notes anonymization policy

### What is anonymized and what is not

**Anonymized (always):**

- Client name and the names of any of its employees, contractors, or end users.
- Sector when it makes the client identifiable (we keep only generic references such as "a European healthcare organization").
- Exact IP addresses, CIDR ranges, and hostnames.
- Timestamps with granularity finer than one day that could be correlated with client events.
- Attributable IoCs (binary hashes, domains, accounts, client-specific tokens).
- Names of internal products, client-owned proprietary tools, or their private scripts.
- Any business figure (headcount, revenue, data volume) that could identify the client.

**Kept (always):**

- The lesson learned and the operational recommendation.
- The TTPs and techniques observed, expressed in standard vocabulary (MITRE ATT&CK, etc.).
- The generic or public tooling that was used.
- Design patterns and anti-patterns that the reader can recognize in their own environments.

### Approval workflow

Before a field note is published, the **X-Ops Consulting engagement owner** reviews the draft and signs approval. The signature is traceable and is archived associated with the article slug. The X-Ops Media editor-in-chief verifies that the approval exists and that the signed version matches the version that goes to publication.

### Retention

The original engagement data **is never retained on the editorial side**. The original data lives in the X-Ops Consulting repository, under the contractual policies of the client. What crosses to the editorial side are the deltas: the anonymized content and the lesson learned. There is no synchronization between the two sides.

### Review

This policy is reviewed at least once a year and whenever X-Ops Consulting disclosure practices change. The current version is published at [xops.media/policies/field-notes-anonymization](https://xops.media/policies/field-notes-anonymization).
