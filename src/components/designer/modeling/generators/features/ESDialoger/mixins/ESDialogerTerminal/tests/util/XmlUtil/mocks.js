export const xmlUtilInputs = [
    {
        input: [
            {
              "name": "Librarian",
              "events": [
                "BookRegistered",
                "BookDiscarded"
              ],
              "lane": 0
            },
            {
              "name": "Member",
              "events": [
                "BookLoaned",
                "BookReserved",
                "BookReturned",
                "LoanExtended"
              ],
              "lane": 1
            }
        ],
        expected: `  <item>
      <name>Librarian</name>
      <events>
        <item>BookRegistered</item>
        <item>BookDiscarded</item>
      </events>
      <lane>0</lane>
  </item>
  <item>
      <name>Member</name>
      <events>
        <item>BookLoaned</item>
        <item>BookReserved</item>
        <item>BookReturned</item>
        <item>LoanExtended</item>
      </events>
      <lane>1</lane>
  </item>`
    }
]