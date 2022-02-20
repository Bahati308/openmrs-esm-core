import React, { useState, useEffect, useMemo } from "react";
import debounce from "lodash-es/debounce";
import uniqueId from "lodash-es/uniqueId";
import { performPersonAttributeTypeSearch } from "./person-attribute-search.resource";
import styles from "./person-attribute-search.scss";
import { useTranslation } from "react-i18next";
import { Search } from "carbon-components-react";

interface PersonAttributeTypeSearchBoxProps {
  value: string;
  setPersonAttributeUuid: (personAttributeType) => void;
}

export function PersonAttributeTypeSearchBox({
  setPersonAttributeUuid,
  value,
}: PersonAttributeTypeSearchBoxProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [activePersonAttributeUuid, setActivePersonAttributeUuid] =
    useState<any>(value);
  const { t } = useTranslation();
  const searchTimeoutInMs = 300;

  const id = useMemo(() => uniqueId(), []);

  const handleUuidChange = (personAttributeType) => {
    setActivePersonAttributeUuid(personAttributeType.uuid);
    resetSearch();
    setPersonAttributeUuid(personAttributeType.uuid);
  };

  const resetSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
  };

  const handleSearchTermChange = debounce((searchTerm) => {
    setSearchTerm(searchTerm);
  }, searchTimeoutInMs);

  useEffect(() => {
    const ac = new AbortController();

    if (searchTerm && searchTerm.length >= 2) {
      performPersonAttributeTypeSearch(searchTerm).then(
        ({ data: { results } }) => {
          setSearchResults(results.slice(0, 9));
        }
      );
    } else {
      setSearchResults([]);
    }
    return () => ac.abort();
  }, [searchTerm]);

  return (
    <div>
      {activePersonAttributeUuid && (
        <p className={styles.activePersonAttributeUuid}>
          {activePersonAttributeUuid}
        </p>
      )}
      <div className={styles.autocomplete}>
        <Search
          id={`search-input-${id}`}
          labelText=""
          type="text"
          size="sm"
          autoComplete="off"
          autoCapitalize="off"
          aria-autocomplete="list"
          role="combobox"
          aria-label={t(
            "searchPersonAttributeHelperText",
            "Person attribute type name"
          )}
          aria-controls={`searchbox-${id}`}
          aria-expanded={searchResults.length > 0}
          placeholder={t(
            "searchPersonAttributeHelperText",
            "Person attribute type name"
          )}
          autoFocus
          onChange={($event) => {
            handleSearchTermChange($event.target.value);
          }}
        />
        <div id={`searchbox-${id}`}>
          <ul role="listbox">
            {!!searchResults.length &&
              searchResults.map((personAttributeType: any) => (
                <li
                  key={personAttributeType.uuid}
                  role="option"
                  style={{ padding: "5px" }}
                  onClick={() => {
                    handleUuidChange(personAttributeType);
                  }}
                  aria-selected="true"
                >
                  {personAttributeType.display}
                </li>
              ))}
            {searchTerm && searchResults && !searchResults.length && (
              <li>
                {t("noPersonAttributeFoundText", "No matching results found")}
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}