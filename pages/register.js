{emailPrefill ? (
  <div style={{ marginBottom: 10 }}>
    <label>E-Mail (aus Einladung):</label>
    <div><strong>{emailPrefill}</strong></div>
  </div>
) : (
  <div style={{ marginBottom: 10 }}>
    <label>Name:</label>
    <input
      required
      value={name}
      onChange={(e) => setName(e.target.value)}
      style={{ width: "100%", marginBottom: 6 }}
    />
    <label>E-Mail:</label>
    <input
      required
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      style={{ width: "100%", marginBottom: 6 }}
    />
  </div>
)}
