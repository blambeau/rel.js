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

  Scenario: Inserting a relation

    Given I open the database
    And I assign the following value to `documents`
      """
      [
        { "id": 1, "title": "Getting started with Finitio", "at": "2014-05-09T15:25" }
      ]
      """
    Then `documents` has one tuple

    Given I insert the following value to `documents`
      """
      [
        { "id": 2, "title": "Getting started with Rel.js", "at": "2014-05-11T09:12" },
        { "id": 3, "title": "Getting started with Alf",    "at": "2014-05-11T09:13" }
      ]
      """
    Then `documents` has three tuples

  Scenario: Delete from a relvar

    Given I open the database
    And I assign the following value to `documents`
      """
      [
        { "id": 1, "title": "Getting started with Finitio", "at": "2014-05-09T15:25" },
        { "id": 2, "title": "Getting started with Rel.js", "at": "2014-05-11T09:12" },
        { "id": 3, "title": "Getting started with Alf",    "at": "2014-05-11T09:13" }
      ]
      """
    Then `documents` has three tuples

    Given I delete from `documents` with the following predicate:
      """
      { "id": 2 }
      """
    Then `documents` has two tuples
    And the document with `{ "id": 2 }` does not exist

  Scenario: Updating a relvar

    Given I open the database
    And I assign the following value to `documents`
      """
      [
        { "id": 1, "title": "Getting started with Finitio", "at": "2014-05-09T15:25" },
        { "id": 2, "title": "Getting started with Rel.js", "at": "2014-05-11T09:12" },
        { "id": 3, "title": "Getting started with Alf",    "at": "2014-05-11T09:13" }
      ]
      """
    Then `documents` has three tuples

    Given I update `documents` where `{ "id": 2 }` with the following updating:
      """
      { "title": "Getting started!!" }
      """
    Then `documents` has three tuples

    Given I ask for the only document with `{ "id": 2 }`
    Then the resulting tuple's `title` is "Getting started!!"
