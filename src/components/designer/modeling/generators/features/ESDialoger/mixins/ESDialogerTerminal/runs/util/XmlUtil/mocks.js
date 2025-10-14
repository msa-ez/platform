export const xmlUtilInputs = [
    {
        "data": [
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
            },
            {
              "name": "System",
              "events": [
                "BookStatusChanged",
                "LoanStatusUpdated",
                "BookLoanHistoryRecorded",
                "BookStatusHistoryRecorded"
              ],
              "lane": 2
            }
        ]
    }
]