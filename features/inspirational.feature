Feature: Inspirational Driven Development

  Background:
    Given I create a logical/physical data using the schema
      """
      Title = String( s | s.length > 0 )

      Logical = {
        documents: {{
          id:    Integer
          title: Title
          at:    Time
        }}
      }

      # Physical schema
      Physical = {
        documents: {{
          id:    .Number
          title: .String
          at:    .String
        }}
      }
      """

  Scenario: Reading a relvar at the initial state

    Given I open the database
    Then `documents` is empty

  Scenario: Assigning a relation value

    Given I open the database
    And I assign the following value to `documents`
      """
      [
        { "id": 1, "title": "Getting started with Finitio", "at": "2014-05-09T15:25" }
      ]
      """
    Then `documents` has one tuple

    Given I ask for the only document with `{ "id": 1 }`
    Then the resulting tuple's `at` is a javascript time
