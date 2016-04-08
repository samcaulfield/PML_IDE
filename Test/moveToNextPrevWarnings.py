# -*- coding: utf-8 -*-
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select
from selenium.common.exceptions import NoSuchElementException
from selenium.common.exceptions import NoAlertPresentException
import unittest, time, re

class MoveToNextPrev(unittest.TestCase):
    def setUp(self):
        self.driver = webdriver.Firefox()
        self.driver.implicitly_wait(30)
        self.base_url = "http://localhost/"
        self.verificationErrors = []
        self.accept_next_alert = True
    
    def test_move_to_next_prev(self):
        driver = self.driver
        f = open('property')
        project_name = f.read()
        f.close()
        driver.get(self.base_url + "/" + project_name + "/")
        print "\nNow testing for Jumping to next/previous warnings"
        driver.find_element_by_css_selector("div.ace_content").click()
        driver.find_element_by_class_name("ace_text-input").send_keys("""
process simple {    
action x{    
requires { foo }    
provides { foo }    
}    
action y{        
requires { foo }    
provides { bar }     
}
}  
""")

        driver.find_element_by_link_text("Tools").click()
        driver.find_element_by_link_text("Check syntax").click()
        driver.execute_script("moveToNext();")
        print("Moved to next warning 2")
        time.sleep(1)
	driver.execute_script("moveToNext();")
        print("Moved to next warning 3")
        time.sleep(1)
        driver.execute_script("moveToPrevious();")
        print ("Moved to previous warning 2")
        driver.execute_script("moveToPrevious();")
        time.sleep(1)
        print ("Moved to previous warning 1")
    def is_element_present(self, how, what):
        try: self.driver.find_element(by=how, value=what)
        except NoSuchElementException as e: return False
        return True
    
    def is_alert_present(self):
        try: self.driver.switch_to_alert()
        except NoAlertPresentException as e: return False
        return True
    
    def close_alert_and_get_its_text(self):
        try:
            alert = self.driver.switch_to_alert()
            alert_text = alert.text
            if self.accept_next_alert:
                alert.accept()
            else:
                alert.dismiss()
            return alert_text
        finally: self.accept_next_alert = True
    
    def tearDown(self):
        self.driver.quit()
        self.assertEqual([], self.verificationErrors)

if __name__ == "__main__":
    unittest.main()
